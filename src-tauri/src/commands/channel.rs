use chrono::Utc;
use tauri::{AppHandle, State};

use crate::{services::db::commands::ChannelData, state::AppState};



#[tauri::command]
pub async fn upsert_channel(
    channel_id: String,
    channel_name: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let db = state.db.clone();

    let _ = db.upsert_channels(vec![ChannelData{
      channel_id,
      channel_name,
      last_updated: Utc::now()
    }]).await?;


    Ok(())
}

#[tauri::command]
pub async fn delete_channel(
    channel_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let db = state.db.clone();

    let _ = db.delete_channel(&channel_id).await?;

    Ok(())
}

#[tauri::command]
pub async fn get_channels(
    state: State<'_, AppState>,
) -> Result<Vec<ChannelData>, String> {
    let db = state.db.clone();

    let channels = db.get_channels().await?;

    Ok(channels)
}