use tauri::generate_handler;

use crate::{
    commands::soop_api::{fetch_streamer_emoticon, fetch_streamer_live, fetch_streamer_station},
    sentiment_analyzer::{analyze_chat, OnnxSession},
    setup::setup,
};

mod commands;
mod sentiment_analyzer;
mod services;
mod setup;
mod state;
mod util;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // ai models onnx 설정
    let onnx_session =
        OnnxSession::new().expect("Failed to initialize the sentiment analysis model.");

    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            setup(app)?;
            Ok(())
        })
        .manage(onnx_session)
        .invoke_handler(generate_handler![
            analyze_chat,
            fetch_streamer_live,
            fetch_streamer_station,
            fetch_streamer_emoticon
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
