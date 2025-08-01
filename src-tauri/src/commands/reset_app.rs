use tauri::State;

use crate::state::AppState;

#[tauri::command]
pub async fn reset_app(state: State<'_, AppState>) -> Result<(), String> {
    let db = state.db.clone();

    // 모든 DB 데이터 삭제
    db.reset_all_data().await?;

    Ok(())
}