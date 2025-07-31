use tauri::State;

use crate::{
    services::db::commands::{
        ChatSearchFilters, ChatSearchResult, EventSearchFilters, EventSearchResult,
        PaginationParams, UserSearchFilters, UserSearchResult,
    },
    state::AppState,
};

#[tauri::command]
pub async fn search_chat_logs(
    filters: ChatSearchFilters,
    pagination: PaginationParams,
    state: State<'_, AppState>,
) -> Result<ChatSearchResult, String> {
    state.db.search_chat_logs(filters, pagination).await
}

#[tauri::command]
pub async fn search_event_logs(
    filters: EventSearchFilters,
    pagination: PaginationParams,
    state: State<'_, AppState>,
) -> Result<EventSearchResult, String> {
    state.db.search_event_logs(filters, pagination).await
}

#[tauri::command]
pub async fn search_user_logs(
    filters: UserSearchFilters,
    pagination: PaginationParams,
    state: State<'_, AppState>,
) -> Result<UserSearchResult, String> {
    state.db.search_user_logs(filters, pagination).await
}
