use chrono::{DateTime, Duration, Utc};
use serde_json;
use std::sync::Arc;
use tauri::State;
use tokio::task;

use crate::{
    models::reports::{ReportData, ReportStatus},
    services::db::commands::{ReportInfo, ReportStatusInfo},
    state::AppState,
};

#[tauri::command]
pub async fn create_report(broadcast_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.clone();

    // 1. 리포트 레코드 생성 (PENDING 상태)
    db.create_report(broadcast_id).await?;

    // 2. 백그라운드에서 리포트 생성 작업 시작
    let db_clone = db.clone();
    task::spawn(async move {
        let db_for_error = db_clone.clone();
        if let Err(e) = generate_report_background(db_clone, broadcast_id).await {
            eprintln!(
                "Report generation failed for broadcast {}: {}",
                broadcast_id, e
            );
            // 실패 상태로 업데이트
            let _ = db_for_error
                .update_report_status(broadcast_id, ReportStatus::Failed.into(), None, Some(e))
                .await;
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn get_report(
    broadcast_id: i64,
    state: State<'_, AppState>,
) -> Result<Option<ReportInfo>, String> {
    state.db.get_report(broadcast_id).await
}

#[tauri::command]
pub async fn delete_report(broadcast_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    state.db.delete_report(broadcast_id).await
}

#[tauri::command]
pub async fn get_report_status(
    broadcast_id: i64,
    state: State<'_, AppState>,
) -> Result<Option<ReportStatusInfo>, String> {
    state.db.get_report_status(broadcast_id).await
}

async fn generate_report_background(
    db: Arc<crate::services::db::service::DBService>,
    broadcast_id: i64,
) -> Result<(), String> {
    // 상태를 GENERATING으로 변경
    db.update_report_status(broadcast_id, ReportStatus::Generating.into(), Some(0.0), None)
        .await?;

    // 방송 세션 정보 조회
    let broadcast_session = db
        .get_broadcast_session(broadcast_id)
        .await?
        .ok_or("Broadcast session not found")?;

    let start_time = broadcast_session.started_at;
    let end_time = broadcast_session.ended_at.unwrap_or_else(|| Utc::now());

    // 10초 단위로 청크 생성
    let chunk_duration = Duration::seconds(10);
    let total_duration = end_time.signed_duration_since(start_time);
    let total_chunks = (total_duration.num_seconds() as f64 / 10.0).ceil() as usize;

    let mut current_time = start_time;
    let mut chunk_index = 0;
    let mut all_chat_logs = Vec::new();
    let mut all_event_logs = Vec::new();

    while current_time < end_time {
        let chunk_end = std::cmp::min(current_time + chunk_duration, end_time);

        // 진행률 업데이트
        let progress = (chunk_index as f64 / total_chunks as f64) * 100.0;
        db.update_report_status(
            broadcast_id,
            ReportStatus::Generating.into(),
            Some(progress),
            None,
        )
        .await?;

        // 청크 단위로 로그 조회
        let chat_logs = db
            .get_chat_logs_for_report(broadcast_id, current_time, chunk_end)
            .await?;

        let event_logs = db
            .get_event_logs_for_report(broadcast_id, current_time, chunk_end)
            .await?;

        // 메모리에 누적 (실제로는 여기서 분석 작업을 수행)
        all_chat_logs.extend(chat_logs);
        all_event_logs.extend(event_logs);

        // 다음 청크로 이동
        current_time = chunk_end;
        chunk_index += 1;

        // 메모리 사용량 제어를 위해 중간중간 처리 가능
        if chunk_index % 100 == 0 {
            tokio::task::yield_now().await;
        }
    }

    // 리포트 데이터 생성
    let report_data = create_report_data(&all_chat_logs, &all_event_logs, start_time, end_time)?;

    // 리포트 데이터를 JSON으로 직렬화
    let report_json = serde_json::to_string(&report_data)
        .map_err(|e| format!("Failed to serialize report data: {}", e))?;

    // 리포트 데이터 저장
    db.update_report_data(broadcast_id, report_json).await?;

    // 완료 상태로 업데이트
    db.update_report_status(broadcast_id, ReportStatus::Completed.into(), Some(100.0), None)
        .await?;

    Ok(())
}

fn create_report_data(
    chat_logs: &[crate::services::db::commands::ChatLogForReport],
    event_logs: &[crate::services::db::commands::EventLogForReport],
    start_time: DateTime<Utc>,
    end_time: DateTime<Utc>,
) -> Result<ReportData, String> {
    use crate::models::reports::*;
    use std::collections::HashMap;

    // 기본 통계 계산
    let total_chat_count = chat_logs.len() as u64;
    let total_event_count = event_logs.len() as u64;

    let unique_users = chat_logs
        .iter()
        .map(|log| &log.user_id)
        .collect::<std::collections::HashSet<_>>()
        .len() as u64;

    let duration_seconds = end_time.signed_duration_since(start_time).num_seconds() as u64;

    // 채팅 분석
    let mut user_message_count = HashMap::new();
    let mut word_count = HashMap::new();

    for log in chat_logs {
        *user_message_count.entry(log.user_id.clone()).or_insert(0) += 1;

        // 간단한 단어 분석 (공백 기준 분할)
        for word in log.message.split_whitespace() {
            *word_count.entry(word.to_lowercase()).or_insert(0) += 1;
        }
    }

    let top_chatters = user_message_count
        .into_iter()
        .map(|(user_id, count)| {
            let username = chat_logs
                .iter()
                .find(|log| log.user_id == user_id)
                .map(|log| log.username.clone())
                .unwrap_or_default();

            UserStats {
                user_id,
                username,
                message_count: count,
                donation_amount: 0, // TODO: 도네이션 정보 계산
            }
        })
        .collect::<Vec<_>>();

    let popular_words = word_count
        .into_iter()
        .map(|(word, count)| WordCount { word, count })
        .collect::<Vec<_>>();

    // 이벤트 분석
    let donation_total = 0u64;
    let mut donation_count = 0u64;
    let mut subscription_count = 0u64;
    let mut moderation_stats = ModerationStats {
        kicks: 0,
        mutes: 0,
        bans: 0,
        freezes: 0,
    };

    for log in event_logs {
        match log.event_type.as_str() {
            "Donation" => {
                donation_count += 1;
                // TODO: payload에서 실제 도네이션 금액 파싱
            }
            "Subscribe" => subscription_count += 1,
            "Kick" => moderation_stats.kicks += 1,
            "Mute" => moderation_stats.mutes += 1,
            "Black" => moderation_stats.bans += 1,
            "Freeze" => moderation_stats.freezes += 1,
            _ => {}
        }
    }

    Ok(ReportData {
        summary: ReportSummary {
            total_chat_count,
            total_event_count,
            unique_users,
            duration_seconds,
            start_time,
            end_time: Some(end_time),
        },
        chat_analysis: ChatAnalysis {
            messages_per_minute: Vec::new(), // TODO: 시간별 분석
            top_chatters,
            chat_sentiment: SentimentAnalysis {
                positive_ratio: 0.0, // TODO: 감정 분석
                negative_ratio: 0.0,
                neutral_ratio: 1.0,
                overall_sentiment: "neutral".to_string(),
            },
            popular_words,
        },
        event_analysis: EventAnalysis {
            donation_total,
            donation_count,
            subscription_count,
            user_joins: event_logs
                .iter()
                .filter(|log| log.event_type == "Enter")
                .count() as u64,
            user_exits: event_logs
                .iter()
                .filter(|log| log.event_type == "Exit")
                .count() as u64,
            moderation_actions: moderation_stats,
        },
        time_analysis: TimeAnalysis {
            activity_by_hour: Vec::new(), // TODO: 시간대별 분석
            peak_activity_time: start_time,
            quiet_periods: Vec::new(),
        },
    })
}
