use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
pub async fn open_app_data_dir(app_handle: AppHandle) -> Result<(), String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    app_handle
        .opener()
        .open_path(app_data_dir.to_string_lossy().as_ref(), None::<&str>)
        .map_err(|e| format!("Failed to open app data directory: {}", e))?;

    Ok(())
}
