use soup_sdk::{
    models::{LiveDetail, SignatureEmoticonData, Station},
    SoopHttpClient,
};

#[tauri::command]
pub async fn fetch_streamer_live(streamer_id: &str) -> Result<Option<LiveDetail>, String> {
    let client = SoopHttpClient::new();

    let (_, live) = client
        .get_live_detail_state(streamer_id)
        .await
        .map_err(|e| e.to_string())?;

    Ok(live)
}

#[tauri::command]
pub async fn fetch_streamer_station(streamer_id: &str) -> Result<Station, String> {
    let client = SoopHttpClient::new();

    let station = client
        .get_station(streamer_id)
        .await
        .map_err(|e| e.to_string())?;

    Ok(station)
}

#[tauri::command]
pub async fn fetch_streamer_emoticon(streamer_id: &str) -> Result<SignatureEmoticonData, String> {
    let client = SoopHttpClient::new();

    let data = client
        .get_signature_emoticon(streamer_id)
        .await
        .map_err(|e| e.to_string())?;

    Ok(data)
}
