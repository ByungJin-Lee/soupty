use chrono::{DateTime, Utc};
use tauri::State;

use crate::{
    services::db::commands::{
        BroadcastSessionResult, BroadcastSessionSearchFilters, BroadcastSessionSearchResult,
        PaginationParams,
    },
    state::AppState,
};

#[tauri::command]
pub async fn delete_broadcast_session(
    broadcast_id: i64,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let db = state.db.clone();
    db.delete_broadcast_session(broadcast_id).await
}

#[tauri::command]
pub async fn search_broadcast_sessions(
    filters: BroadcastSessionSearchFilters,
    pagination: PaginationParams,
    state: State<'_, AppState>,
) -> Result<BroadcastSessionSearchResult, String> {
    state
        .db
        .search_broadcast_sessions(filters, pagination)
        .await
}

#[tauri::command]
pub async fn get_broadcast_session(
    broadcast_id: i64,
    state: State<'_, AppState>,
) -> Result<Option<BroadcastSessionResult>, String> {
    state.db.get_broadcast_session(broadcast_id).await
}

#[tauri::command]
pub async fn update_broadcast_session_end_time(
    broadcast_id: i64,
    ended_at: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let ended_at_parsed = DateTime::parse_from_rfc3339(&ended_at)
        .map_err(|e| format!("Invalid datetime format: {}", e))?
        .with_timezone(&Utc);

    state
        .db
        .update_broadcast_session_end_time(broadcast_id, ended_at_parsed)
        .await
}

#[tauri::command]
pub async fn update_broadcast_vod_id(
    broadcast_id: i64,
    vod_id: u64,
    state: State<'_, AppState>,
) -> Result<(), String> {
    state.db.update_broadcast_vod_id(broadcast_id, vod_id).await
}
