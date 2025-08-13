use chrono::{Duration, Utc};
use serde_json;
use std::sync::Arc;
use tauri::State;
use tokio::task;

use crate::{
    models::reports::{ReportChunk, ReportStatus},
    services::{
        addons::data_enrichment::token_analyzer::TokenAnalyzer,
        db::commands::{ReportInfo, ReportStatusInfo},
    },
    state::AppState,
    util::reports::{create_report_chunk, create_report_data, CHUNK_SIZE},
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
    let token_analyzer = TokenAnalyzer::global();
    // 상태를 GENERATING으로 변경
    db.update_report_status(
        broadcast_id,
        ReportStatus::Generating.into(),
        Some(0.0),
        None,
    )
    .await?;

    // 방송 세션 정보 조회
    let broadcast_session = db
        .get_broadcast_session(broadcast_id)
        .await?
        .ok_or("Broadcast session not found")?;

    let start_time = broadcast_session.started_at;
    let end_time = broadcast_session.ended_at.unwrap_or_else(|| Utc::now());

    let chunk_duration = Duration::seconds(CHUNK_SIZE as i64);
    let total_duration = end_time.signed_duration_since(start_time);
    let total_chunks = (total_duration.num_seconds() as f64 / CHUNK_SIZE as f64).ceil() as usize;

    let mut current_time = start_time;
    let mut chunk_index = 0;

    let mut chunks: Vec<ReportChunk> = Vec::new();
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

        chunks.push(create_report_chunk(
            chunk_index,
            current_time.clone(),
            &chat_logs,
            &event_logs,
            token_analyzer,
        ));
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
    let report_data = create_report_data(
        chunks,
        start_time,
        end_time,
        CHUNK_SIZE,
        &all_chat_logs,
        &all_event_logs,
        token_analyzer,
    )?;

    // 리포트 데이터를 JSON으로 직렬화
    let report_json = serde_json::to_string(&report_data)
        .map_err(|e| format!("Failed to serialize report data: {}", e))?;

    // 리포트 데이터 저장
    db.update_report_data(broadcast_id, report_json).await?;

    // 완료 상태로 업데이트
    db.update_report_status(
        broadcast_id,
        ReportStatus::Completed.into(),
        Some(100.0),
        None,
    )
    .await?;

    Ok(())
}
