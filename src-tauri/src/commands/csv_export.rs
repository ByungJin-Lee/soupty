use tauri::State;

use crate::services::csv_exporter::csv_exporter::{CSVExporter, CsvExportOptions};
use crate::state::AppState;

#[tauri::command]
pub async fn export_events_to_csv(
    options: CsvExportOptions,
    app_state: State<'_, AppState>,
) -> Result<String, String> {
    println!("CSV Export command called");
    println!("Options received: {:?}", options);

    let csv_exporter = CSVExporter::new(app_state.db.as_ref().clone());

    match csv_exporter.export_events_to_csv(options).await {
        Ok(result) => {
            println!("CSV Export successful: {}", result);
            Ok(result)
        }
        Err(error) => {
            println!("CSV Export failed: {}", error);
            Err(error)
        }
    }
}

#[tauri::command]
pub async fn get_supported_event_types() -> Result<Vec<String>, String> {
    use crate::models::events::{
        EVENT_TYPE_CHAT, EVENT_TYPE_DONATION, EVENT_TYPE_KICK, EVENT_TYPE_METADATA_UPDATE,
        EVENT_TYPE_MUTE,
    };

    Ok(vec![
        EVENT_TYPE_CHAT.to_string(),
        EVENT_TYPE_DONATION.to_string(),
        EVENT_TYPE_MUTE.to_string(),
        EVENT_TYPE_KICK.to_string(),
        EVENT_TYPE_METADATA_UPDATE.to_string(),
    ])
}
