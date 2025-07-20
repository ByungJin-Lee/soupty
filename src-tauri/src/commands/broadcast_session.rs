use tauri::State;

use crate::{
    services::db::commands::{BroadcastSessionSearchFilters, PaginationParams, BroadcastSessionSearchResult, BroadcastSessionResult},
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
    state.db.search_broadcast_sessions(filters, pagination).await
}

#[tauri::command]
pub async fn get_broadcast_session(
    broadcast_id: i64,
    state: State<'_, AppState>,
) -> Result<Option<BroadcastSessionResult>, String> {
    state.db.get_broadcast_session(broadcast_id).await
}