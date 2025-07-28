use tauri::{async_runtime::spawn, AppHandle, State};

use crate::{
    controllers::event_bus::SystemEvent, services::addons::interface::BroadcastMetadata,
    state::AppState,
};

#[tauri::command]
pub async fn start_main_controller(
    channel_id: String,
    state: State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut controller = state.main_controller.lock().await;
    let event_bus = controller.event_bus.clone();

    let _ = controller
        .start(&channel_id, app_handle.clone(), state.db.clone())
        .await
        .map_err(|e| e.to_string())?;

    // Subscribe to SystemStopping events to handle stop calls
    let main_controller_ref = state.main_controller.clone();
    let db_ref = state.db.clone();
    let app_handle_clone = app_handle.clone();
    spawn(async move {
        let mut receiver = event_bus.subscribe("command_stop_listener").await;
        while let Some(event) = receiver.recv().await {
            if let SystemEvent::SystemStopping = event {
                if let Ok(mut controller) = main_controller_ref.try_lock() {
                    let _ = controller
                        .stop(app_handle_clone.clone(), db_ref.clone())
                        .await;
                }
                break;
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn stop_main_controller(
    state: State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut controller = state.main_controller.lock().await;

    let _ = controller.stop(app_handle, state.db.clone()).await;

    Ok(())
}

#[tauri::command]
pub async fn get_main_controller_context(
    state: State<'_, AppState>,
) -> Result<Option<BroadcastMetadata>, String> {
    let controller = state.main_controller.lock().await;
    Ok(controller
        .metadata_manager
        .get_metadata()
        .await
        .map_err(|e| e.to_string())?)
}
