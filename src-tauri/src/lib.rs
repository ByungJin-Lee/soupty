use tauri::generate_handler;

use crate::{
    commands::{
        channel::{delete_channel, get_channels, upsert_channel},
        main_controller::{start_main_controller, stop_main_controller},
        soop_api::{fetch_streamer_emoticon, fetch_streamer_live, fetch_streamer_station},
        splash::{
            check_for_updates, connect_database, setup_ai, setup_app_state, show_main_window,
        },
    },
    sentiment_analyzer::analyze_chat,
};

mod commands;
mod controllers;
mod models;
mod sentiment_analyzer;
mod services;
mod state;
mod util;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(generate_handler![
            analyze_chat,
            fetch_streamer_live,
            fetch_streamer_station,
            fetch_streamer_emoticon,
            start_main_controller,
            stop_main_controller,
            upsert_channel,
            delete_channel,
            get_channels,
            check_for_updates,
            connect_database,
            setup_ai,
            setup_app_state,
            show_main_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
