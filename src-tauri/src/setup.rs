use crate::services::db::service::DBService;
use crate::state::AppState;
use crate::{controllers::main_controller::MainController, sentiment_analyzer::OnnxSession};
use anyhow::{Context, Result};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::path::BaseDirectory;
use tauri::{App, Manager};
use tokio::sync::Mutex;

pub fn setup(app: &mut App) -> Result<()> {
    let app_state = initialize_core_services(app)?;
    app.manage(app_state);
    Ok(())
}

/// 애플리케이션의 핵심 서비스(DB 등)를 초기화하고 AppState를 생성합니다.
#[cfg(not(target_os = "windows"))]
pub fn initialize_core_services(app: &App) -> Result<AppState> {
    // 1. 데이터베이스 경로 확보 및 폴더 생성
    let db_path = initialize_app_paths(app).context("Failed to initialize app paths")?;
    println!("Database path: {:?}", db_path);

    // 2. 데이터베이스 서비스 초기화
    let db_service = initialize_db_service(&db_path).context("Failed to initialize DB service")?;

    // 3. AppState 생성
    let app_state = AppState {
        db: Arc::new(db_service),
        main_controller: Mutex::new(MainController::new()), // 추후 추가
    };

    let model_dir = app.path().resolve("ai", BaseDirectory::Resource)?;

    // ai models onnx 설정
    let onnx_session =
        OnnxSession::new(model_dir).expect("Failed to initialize the sentiment analysis model.");

    app.manage(onnx_session);

    Ok(app_state)
}

#[cfg(target_os = "windows")]
pub fn initialize_core_services(app: &App) -> Result<AppState> {
    // 1. 데이터베이스 경로 확보 및 폴더 생성
    let db_path = initialize_app_paths(app).context("Failed to initialize app paths")?;
    println!("Database path: {:?}", db_path);

    // 2. 데이터베이스 서비스 초기화
    let db_service = initialize_db_service(&db_path).context("Failed to initialize DB service")?;

    // 3. AppState 생성
    let app_state = AppState {
        db: Arc::new(db_service),
        main_controller: Mutex::new(MainController::new()), // 추후 추가
    };

    // ort 관련 설정 - window 일때만

    let resource_path = app
        .path()
        .resolve("lib/onnxruntime.dll", BaseDirectory::Resource)?;

    ort::init_from(resource_path.to_string_lossy()).commit()?;

    // ai models onnx 설정

    let model_dir = app.path().resolve("ai", BaseDirectory::Resource)?;

    let onnx_session =
        OnnxSession::new(model_dir).expect("Failed to initialize the sentiment analysis model.");

    app.manage(onnx_session);

    Ok(app_state)
}

/// 플랫폼에 맞는 데이터 경로를 확보하고, 폴더가 없으면 생성합니다.
fn initialize_app_paths(app: &App) -> Result<PathBuf> {
    let app_dir = app.path().app_data_dir().ok().unwrap();

    std::fs::create_dir_all(&app_dir).context(format!(
        "Could not create app data directory at {:?}",
        app_dir
    ))?;

    Ok(app_dir.join("app.db"))
}

/// DbService를 생성하고 비동기적으로 초기화(마이그레이션 등)합니다.
fn initialize_db_service(db_path: &PathBuf) -> Result<DBService> {
    let db_service = DBService::new(db_path);
    Ok(db_service)
}
