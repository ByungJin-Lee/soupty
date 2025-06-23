use tauri::{AppHandle, State};

use crate::state::AppState;

#[tauri::command]
pub async fn start_main_controller(
    channel_id: String,
    state: State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut controller = state.main_controller.lock().await;

    controller
        .start(&channel_id, app_handle, state.db.clone())
        .await
        .map_err(|e| e.to_string());

    Ok(())
}

#[tauri::command]
pub async fn stop_main_controller(state: State<'_, AppState>) -> Result<(), String> {
    let mut controller = state.main_controller.lock().await;

    controller.stop();

    Ok(())
}
