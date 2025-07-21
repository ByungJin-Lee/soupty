use crate::services::db::service::DBService;
use crate::state::AppState;
use anyhow::{Context, Result as AnyhowResult};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Emitter, Manager, State};

#[tauri::command]
pub async fn check_for_updates() -> Result<(), String> {
    // 업데이트 확인 로직
    // 실제 업데이트 체크는 tauri-plugin-updater를 사용하거나
    // 커스텀 업데이트 체크 로직을 구현할 수 있습니다

    // 예시: 간단한 지연을 통한 업데이트 체크 시뮬레이션
    tokio::time::sleep(tokio::time::Duration::from_millis(800)).await;

    // 실제 업데이트 체크 로직은 여기에 구현
    println!("업데이트 확인 완료");

    Ok(())
}

#[tauri::command]
pub async fn connect_database(app_handle: AppHandle) -> Result<(), String> {
    println!("DB 연결 시작...");

    // 데이터베이스 경로 확보 및 폴더 생성
    let db_path = initialize_app_paths(&app_handle).map_err(|e| e.to_string())?;
    println!("Database path: {:?}", db_path);

    // 데이터베이스 서비스 초기화
    let db_service = initialize_db_service(&db_path).await?;

    // 글로벌 상태에 DB 서비스 저장 (임시로 manage 사용)
    app_handle.manage(Arc::new(db_service));

    println!("DB 연결 완료");
    Ok(())
}

/// 플랫폼에 맞는 데이터 경로를 확보하고, 폴더가 없으면 생성합니다.
fn initialize_app_paths(app: &AppHandle) -> AnyhowResult<PathBuf> {
    let app_dir = app.path().app_data_dir().ok().unwrap();

    std::fs::create_dir_all(&app_dir).context(format!(
        "Could not create app data directory at {:?}",
        app_dir
    ))?;

    Ok(app_dir.join("app.db"))
}

/// DbService를 생성하고 비동기적으로 초기화(마이그레이션 등)합니다.
async fn initialize_db_service(db_path: &PathBuf) -> Result<DBService, String> {
    let db_service = DBService::new(db_path).await?;
    Ok(db_service)
}

#[tauri::command]
pub async fn setup_ai(app_handle: AppHandle) -> Result<(), String> {
    println!("AI 설정 시작...");

    // AI 모델 디렉토리 경로 확보
    let model_dir = app_handle
        .path()
        .resolve("ai", BaseDirectory::Resource)
        .map_err(|e| format!("AI 모델 디렉토리 경로 확보 실패: {}", e))?;

    // Windows용 ONNX Runtime 초기화
    #[cfg(target_os = "windows")]
    {
        let resource_path = app_handle
            .path()
            .resolve("lib/onnxruntime.dll", BaseDirectory::Resource)
            .map_err(|e| format!("ONNX Runtime DLL 경로 확보 실패: {}", e))?;

        ort::init_from(resource_path.to_string_lossy())
            .commit()
            .map_err(|e| format!("ONNX Runtime 초기화 실패: {}", e))?;
    }

    // ONNX 세션 생성
    let onnx_session = crate::sentiment_analyzer::OnnxSession::new(model_dir)
        .map_err(|e| format!("ONNX 세션 생성 실패: {}", e))?;

    // 글로벌 상태에 ONNX 세션 저장
    app_handle.manage(onnx_session);

    println!("AI 설정 완료");
    Ok(())
}

#[tauri::command]
pub async fn setup_app_state(app_handle: AppHandle) -> Result<(), String> {
    println!("App State 설정 시작...");

    // 이미 설정된 DB 서비스 가져오기
    let db_service = app_handle.state::<Arc<DBService>>().inner().clone();

    // MainController 초기화
    let main_controller = std::sync::Arc::new(
        tokio::sync::Mutex::new(crate::controllers::main_controller::MainController::new())
    );

    // AppState 생성
    let app_state = AppState {
        db: db_service,
        main_controller,
    };

    // 글로벌 상태에 AppState 저장
    app_handle.manage(app_state);

    println!("App State 설정 완료");
    Ok(())
}

#[tauri::command]
pub async fn get_target_users(app_state: State<'_, AppState>) -> Result<Vec<String>, String> {
    app_state.db.get_target_users().await
}

#[tauri::command]
pub async fn add_target_user(
    user_id: String,
    app_state: State<'_, AppState>,
) -> Result<(), String> {
    app_state.db.add_target_user(user_id, None).await
}

#[tauri::command]
pub async fn remove_target_user(
    user_id: String,
    app_state: State<'_, AppState>,
) -> Result<(), String> {
    app_state.db.remove_target_user(user_id).await
}

#[tauri::command]
pub async fn show_main_window(app_handle: AppHandle) -> Result<(), String> {
    // 메인 윈도우 표시
    if let Some(main_window) = app_handle.get_webview_window("main") {
        // splash 초기화 완료 이벤트 발생 (메인 윈도우로)
        app_handle
            .emit_to("main", "splash-initialization-complete", ())
            .map_err(|e| e.to_string())?;

        main_window.show().map_err(|e| e.to_string())?;
        main_window.set_focus().map_err(|e| e.to_string())?;
    }

    Ok(())
}
