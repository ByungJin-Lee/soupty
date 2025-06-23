use std::sync::Arc;

use anyhow::Result;
use soup_sdk::{
    chat::{SoopChatConnection, SoopChatOptions},
    SoopHttpClient,
};
use tauri::{
    async_runtime::{spawn, JoinHandle},
    AppHandle,
};

use crate::{
    controllers::addon_manager::AddonManager,
    services::{
        addons::{default_ui::DefaultUIAddon, interface::AddonContext},
        db::service::DBService,
        event_mapper::map_sdk_to_domain,
    },
};

#[derive(PartialEq)]
pub enum SystemStatus {
    Idle,
    Running,
}

pub struct MainController {
    listener_task: Option<JoinHandle<()>>,
    addon_manager: AddonManager,
    pub status: SystemStatus,
}

impl MainController {
    pub fn new() -> Self {
        Self {
            addon_manager: AddonManager::new(),
            status: SystemStatus::Idle,
            listener_task: None,
        }
    }

    pub async fn start(
        &mut self,
        streamer_id: &str,
        app_handle: AppHandle,
        db: Arc<DBService>,
    ) -> Result<()> {
        // 이미 실행중인 경우, 무시
        if self.status == SystemStatus::Running {
            return Err(anyhow::anyhow!("이미 실행 중입니다."));
        }

        // chat conn 관련 사전 작업
        let soop_client = SoopHttpClient::new();

        let chat_conn = SoopChatConnection::new(
            Arc::new(soop_client),
            SoopChatOptions {
                streamer_id: streamer_id.to_string(),
            },
        )?;
        let mut event_bus = chat_conn.subscribe();
        chat_conn.start().await?;
        // 작업 완료

        let ctx = AddonContext { app_handle, db };

        // addon 등록
        self.addon_manager.register(Arc::new(DefaultUIAddon::new()));
        // addon 등록 끝

        let manager = self.addon_manager.clone();
        let task_handle = spawn(async move {
            loop {
                // 이벤트를 받으면
                match event_bus.recv().await {
                    Ok(e) => {
                        if let Some(de) = map_sdk_to_domain(&e) {
                            manager.dispatch(&ctx, &de).await
                        }
                    }
                    Err(_) => {
                        break;
                    }
                }
                // 이벤트를 domain event로 파싱한 후
            }
        });

        self.listener_task = Some(task_handle);
        self.status = SystemStatus::Running;
        Ok(())
    }

    pub fn stop(&mut self) {
        // 이미 정지상태인 경우, 무시
        if self.status == SystemStatus::Idle {
            return;
        }
        // 처리
        if let Some(task) = self.listener_task.take() {
            task.abort();
            self.status = SystemStatus::Idle;
        }
    }
}
