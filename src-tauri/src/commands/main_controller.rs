use tauri::{AppHandle, State};

use crate::{services::addons::interface::BroadcastMetadata, state::AppState};

#[tauri::command]
pub async fn start_main_controller(
    channel_id: String,
    state: State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut controller = state.main_controller.lock().await;

    let _ = controller
        .start(&channel_id, app_handle, state.db.clone())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn stop_main_controller(
    state: State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut controller = state.main_controller.lock().await;

    controller.stop(app_handle, state.db.clone()).await;

    Ok(())
}

#[tauri::command]
pub async fn get_main_controller_context(
    state: State<'_, AppState>,
) -> Result<Option<BroadcastMetadata>, String> {
    let controller = state.main_controller.lock().await;
    Ok(controller.metadata_manager.get_metadata().await.map_err(|e| e.to_string())?)
}
