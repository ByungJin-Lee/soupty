use chrono::{Duration, Utc};
use std::collections::VecDeque;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::task::JoinHandle;
use tokio::time::{interval, Duration as TokioDuration};

use crate::services::event_name;
use crate::services::stats::active_chatter_ranking_stats::ActiveChatterRankingStats;
use crate::services::stats::active_viewer_stats::ActiveViewerStats;
use crate::services::stats::interface::StatsMatrix;
use crate::services::stats::lol_stats::LOLStats;
use crate::services::stats::sentiment_stats::SentimentStats;
use crate::services::stats::word_count_stats::WordCountStats;

use super::chat_per_minute_stats::ChatPerMinuteStats;
use super::models::*;
use super::stats_trait::Stats;
use tauri::{AppHandle, Emitter};

const CYCLE_DURATION_MS: u64 = 2500;

fn cycles_to_duration(cycles: u64) -> TokioDuration {
    TokioDuration::from_millis(cycles * CYCLE_DURATION_MS)
}

pub struct CoreStatsService {
    chat_data: Arc<RwLock<VecDeque<EnrichedChatData>>>,
    donation_data: Arc<RwLock<VecDeque<EnrichedDonationData>>>,
    time_window_minutes: u32,
    stats_processors: Vec<Box<dyn Stats>>,
    app_handle: AppHandle,
    max_buffer_size: usize,
    cleanup_task: Arc<RwLock<Option<JoinHandle<()>>>>,
    batch_task: Arc<RwLock<Option<JoinHandle<()>>>>,
}

impl CoreStatsService {
    const DEFAULT_MAX_BUFFER_SIZE: usize = 50000; // 기본 최대 버퍼 크기

    pub fn new(time_window_minutes: u32, app_handle: AppHandle) -> Self {
        let mut service = Self {
            chat_data: Arc::new(RwLock::new(VecDeque::with_capacity(1000))),
            donation_data: Arc::new(RwLock::new(VecDeque::with_capacity(100))),
            time_window_minutes,
            stats_processors: Vec::new(),
            app_handle,
            max_buffer_size: Self::DEFAULT_MAX_BUFFER_SIZE,
            cleanup_task: Arc::new(RwLock::new(None)),
            batch_task: Arc::new(RwLock::new(None)),
        };

        service.add_stats_processor(Box::new(ChatPerMinuteStats::new()));
        service.add_stats_processor(Box::new(LOLStats::new()));
        service.add_stats_processor(Box::new(ActiveViewerStats::new()));
        service.add_stats_processor(Box::new(ActiveChatterRankingStats::new()));
        service.add_stats_processor(Box::new(WordCountStats::new()));
        service.add_stats_processor(Box::new(SentimentStats::new()));
        service
    }

    pub fn add_stats_processor(&mut self, processor: Box<dyn Stats>) {
        self.stats_processors.push(processor);
    }

    pub async fn record_chat_data(&self, data: EnrichedChatData) {
        let mut chat_data = self.chat_data.write().await;
        chat_data.push_back(data);

        // 메모리 제한 - 최대 크기 초과 시 오래된 데이터 제거
        if chat_data.len() > self.max_buffer_size {
            chat_data.pop_front();
        }
    }

    pub async fn record_donation_data(&self, data: EnrichedDonationData) {
        let mut donation_data = self.donation_data.write().await;
        donation_data.push_back(data);

        // 도네이션은 일반적으로 적으므로 채팅의 1/10 크기로 제한
        let max_donation_size = self.max_buffer_size / 10;
        if donation_data.len() > max_donation_size {
            donation_data.pop_front();
        }
    }

    pub fn start_stats_scheduler(self: Arc<Self>) {
        // 데이터 정리 작업을 1초마다 실행
        let cleanup_service = Arc::clone(&self);
        let cleanup_task = tokio::spawn(async move {
            let mut cleanup_timer = interval(TokioDuration::from_secs(1));

            loop {
                cleanup_timer.tick().await;
                cleanup_service.cleanup_old_data_periodic().await;
            }
        });

        // 배치 처리 스케줄러 - 각 통계의 interval_cycles에 따라 계산
        let batch_service = Arc::clone(&self);
        let batch_task = tokio::spawn(async move {
            let mut batch_timer = interval(cycles_to_duration(1));
            let mut cycle_count = 0u64;

            loop {
                batch_timer.tick().await;
                cycle_count += 1;

                batch_service.process_all_stats_batch(cycle_count).await;
            }
        });

        // 태스크 핸들 저장 (동기적으로 가능한 경우)
        if let Ok(mut guard) = self.cleanup_task.try_write() {
            *guard = Some(cleanup_task);
        }
        if let Ok(mut guard) = self.batch_task.try_write() {
            *guard = Some(batch_task);
        }
    }

    async fn process_all_stats_batch(&self, cycle_count: u64) {
        // 한 번만 락 획득하여 데이터 복사
        let (chat_data_clone, donation_data_clone) = {
            let (chat_guard, donation_guard) =
                tokio::join!(self.chat_data.read(), self.donation_data.read());
            (chat_guard.clone(), donation_guard.clone())
        };

        let results: Vec<StatsMatrix> = self
            .stats_processors
            .iter()
            .filter(|processor| cycle_count % processor.interval_cycles() == 0)
            .map(|processor| processor.evaluate(&chat_data_clone, &donation_data_clone))
            .collect();

        for stat in results {
            let _ = self.app_handle.emit(event_name::LOG_STATS, &stat);
        }
    }

    async fn cleanup_old_data_periodic(&self) {
        let current_time = Utc::now();
        let cutoff_time = current_time - Duration::minutes(self.time_window_minutes as i64);

        // 채팅 데이터 정리 - VecDeque에서 앞쪽부터 제거
        {
            let mut chat_data = self.chat_data.write().await;
            while let Some(front) = chat_data.front() {
                if front.get_timestamp() >= cutoff_time {
                    break;
                }
                chat_data.pop_front();
            }
        }

        // 도네이션 데이터 정리 - VecDeque에서 앞쪽부터 제거
        {
            let mut donation_data = self.donation_data.write().await;
            while let Some(front) = donation_data.front() {
                if front.get_timestamp() >= cutoff_time {
                    break;
                }
                donation_data.pop_front();
            }
        }
    }

    pub async fn stop(&self) {
        // cleanup 태스크 종료
        let mut cleanup_guard = self.cleanup_task.write().await;
        if let Some(task) = cleanup_guard.take() {
            task.abort();
        }

        // batch 태스크 종료
        let mut batch_guard = self.batch_task.write().await;
        if let Some(task) = batch_guard.take() {
            task.abort();
        }
    }
}
