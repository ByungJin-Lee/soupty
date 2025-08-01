use tauri::generate_handler;

use crate::commands::{
    broadcast_session::{
        delete_broadcast_session, get_broadcast_session, search_broadcast_sessions,
        update_broadcast_session_end_time, update_broadcast_vod_id,
    },
    channel::{delete_channel, get_channels, upsert_channel},
    chat_history::{search_chat_logs, search_event_logs, search_user_logs},
    csv_export::{export_events_to_csv, get_supported_event_types},
    main_controller::{get_main_controller_context, start_main_controller, stop_main_controller},
    reports::{create_report, delete_report, get_report, get_report_status},
    reset_app::reset_app,
    soop_api::{
        fetch_streamer_emoticon, fetch_streamer_live, fetch_streamer_station,
        fetch_streamer_vod_detail, fetch_streamer_vod_list,
    },
    splash::{
        add_target_user, check_for_updates, connect_database, get_target_users, remove_target_user,
        setup_ai, setup_app_state, show_main_window,
    },
};

mod commands;
mod controllers;
mod models;
mod services;
mod state;
mod util;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
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
            fetch_streamer_live,
            fetch_streamer_station,
            fetch_streamer_emoticon,
            fetch_streamer_vod_list,
            fetch_streamer_vod_detail,
            start_main_controller,
            stop_main_controller,
            get_main_controller_context,
            upsert_channel,
            delete_channel,
            get_channels,
            add_target_user,
            check_for_updates,
            connect_database,
            get_target_users,
            remove_target_user,
            search_chat_logs,
            search_event_logs,
            search_user_logs,
            delete_broadcast_session,
            update_broadcast_vod_id,
            get_broadcast_session,
            search_broadcast_sessions,
            update_broadcast_session_end_time,
            create_report,
            delete_report,
            get_report,
            get_report_status,
            setup_ai,
            setup_app_state,
            show_main_window,
            export_events_to_csv,
            get_supported_event_types,
            reset_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
