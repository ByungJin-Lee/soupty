use tauri::generate_handler;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_updater::UpdaterExt;

use crate::commands::{
    broadcast_session::{
        delete_broadcast_session, get_broadcast_session, search_broadcast_sessions,
        update_broadcast_session_end_time, update_broadcast_vod_id,
    },
    channel::{delete_channel, get_channels, upsert_channel},
    chat_history::{get_user_log_dates, search_chat_logs, search_event_logs, search_user_logs},
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
    utils::open_app_data_dir,
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
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // We use the handle to call updater and restart
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                // Notice we use the handle to get the updater
                match handle.updater().unwrap().check().await {
                    Ok(Some(update)) => {
                        log::info!("업데이트 {} 가능!", update.version);

                        // ---- V2 UPDATER DIALOG LOGIC ----
                        let question = format!(
                            "새로운 버전이({}) 이용가능합니다. 업데이트 하시겠습니까?",
                            update.version
                        );

                        // Use the new non-blocking dialog with a callback
                        handle
                            .dialog()
                            .message(question)
                            .title("업데이트")
                            .buttons(tauri_plugin_dialog::MessageDialogButtons::YesNo)
                            .kind(tauri_plugin_dialog::MessageDialogKind::Info)
                            .show(move |answer_is_yes| {
                                if answer_is_yes {
                                    log::info!("업데이트 시작");

                                    let update_handle = handle.clone();
                                    tauri::async_runtime::spawn(async move {
                                        if let Err(e) =
                                            update.download_and_install(|_, _| {}, || {}).await
                                        {
                                            log::error!("Failed to install update: {}", e);
                                        } else {
                                            // Relaunch after successful install
                                            update_handle.restart();
                                        }
                                    });
                                } else {
                                    log::info!("사용자가 업데이트를 중단했습니다.");
                                }
                            });
                    }
                    Ok(None) => {
                        log::info!("완료");
                    }
                    Err(e) => {
                        log::error!("업데이트 실패: {}", e);
                    }
                }
            });

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
            get_user_log_dates,
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
            reset_app,
            open_app_data_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
