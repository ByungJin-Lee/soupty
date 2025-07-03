use chrono::{DateTime, Duration, Utc};
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{interval, Duration as TokioDuration};

use crate::services::event_name;
use crate::services::stats::active_viewer_stats::ActiveViewerStats;
use crate::services::stats::lol_stats::LOLStats;

use super::chat_per_minute_stats::ChatPerMinuteStats;
use super::models::*;
use super::stats_trait::Stats;
use tauri::{AppHandle, Emitter};

pub struct CoreStatsService {
    chat_data: Arc<RwLock<Vec<EnrichedChatData>>>,
    donation_data: Arc<RwLock<Vec<EnrichedDonationData>>>,
    time_window_minutes: u32,
    stats_processors: Vec<Box<dyn Stats>>,
    app_handle: AppHandle,
}

impl CoreStatsService {
    pub fn new(time_window_minutes: u32, app_handle: AppHandle) -> Self {
        let mut service = Self {
            chat_data: Arc::new(RwLock::new(Vec::new())),
            donation_data: Arc::new(RwLock::new(Vec::new())),
            time_window_minutes,
            stats_processors: Vec::new(),
            app_handle,
        };

        service.add_stats_processor(Box::new(ChatPerMinuteStats::new()));
        service.add_stats_processor(Box::new(LOLStats::new()));
        service.add_stats_processor(Box::new(ActiveViewerStats::new()));
        service
    }

    pub fn add_stats_processor(&mut self, processor: Box<dyn Stats>) {
        self.stats_processors.push(processor);
    }

    pub async fn record_chat_data(&self, data: EnrichedChatData) {
        let mut chat_data = self.chat_data.write().await;
        self.cleanup_old_data(&mut chat_data, data.timestamp).await;
        chat_data.push(data);
    }

    pub async fn record_donation_data(&self, data: EnrichedDonationData) {
        let mut donation_data = self.donation_data.write().await;
        self.cleanup_old_data(&mut donation_data, data.timestamp)
            .await;
        donation_data.push(data);
    }

    pub fn start_stats_scheduler(self: Arc<Self>) {
        for processor in &self.stats_processors {
            let processor_interval = processor.interval();
            let service_clone = Arc::clone(&self);
            let processor_name = processor.name().to_string();

            tokio::spawn(async move {
                let mut timer = interval(TokioDuration::from_millis(processor_interval));

                loop {
                    timer.tick().await;

                    if let Some(processor) = service_clone
                        .stats_processors
                        .iter()
                        .find(|p| p.name() == processor_name)
                    {
                        let value = processor
                            .evaluate(&service_clone.chat_data, &service_clone.donation_data)
                            .await;

                        let stats_event = StatsEvent {
                            name: processor_name.clone(),
                            value,
                        };

                        let _ = service_clone
                            .app_handle
                            .emit(event_name::LOG_STATS, &stats_event);
                    }
                }
            });
        }
    }

    async fn cleanup_old_data<T>(&self, data: &mut Vec<T>, current_time: DateTime<Utc>)
    where
        T: HasTimestamp,
    {
        let cutoff_time = current_time - Duration::minutes(self.time_window_minutes as i64);
        data.retain(|item| item.get_timestamp() >= cutoff_time);
    }
}

trait HasTimestamp {
    fn get_timestamp(&self) -> DateTime<Utc>;
}

impl HasTimestamp for EnrichedChatData {
    fn get_timestamp(&self) -> DateTime<Utc> {
        self.timestamp
    }
}

impl HasTimestamp for EnrichedDonationData {
    fn get_timestamp(&self) -> DateTime<Utc> {
        self.timestamp
    }
}
