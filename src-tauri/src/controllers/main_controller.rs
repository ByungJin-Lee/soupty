use std::sync::Arc;

use anyhow::Result;
use tauri::{async_runtime::JoinHandle, AppHandle};

use crate::{
    controllers::{
        addon_manager::AddonManager,
        event_bus::{EventBusManager, SystemEvent},
        metadata_manager::MetadataManager,
        scheduler::Scheduler,
        system_initializer::SystemInitializer,
        task_scheduler::TaskScheduler,
    },
    services::{addons::interface::AddonContext, db::service::DBService},
};

#[derive(PartialEq)]
pub enum SystemStatus {
    Idle,
    Running,
}

pub struct MainController {
    listener_task: Option<JoinHandle<()>>,
    addon_manager: AddonManager,
    pub metadata_manager: MetadataManager,
    pub scheduler: Scheduler,
    pub event_bus: EventBusManager,
    pub status: SystemStatus,
}

impl MainController {
    pub fn new() -> Self {
        Self {
            addon_manager: AddonManager::new(),
            metadata_manager: MetadataManager::new(),
            scheduler: Scheduler::new(),
            event_bus: EventBusManager::new(),
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
        self.validate_not_running()?;

        self.start_event_driven_system(streamer_id, app_handle, db)
            .await?;

        Ok(())
    }

    async fn start_event_driven_system(
        &mut self,
        streamer_id: &str,
        app_handle: AppHandle,
        db: Arc<DBService>,
    ) -> Result<()> {
        let initializer = SystemInitializer::new(
            self.event_bus.clone(),
            self.scheduler.clone(),
            app_handle.clone(),
        );
        let task_scheduler = TaskScheduler::new(self.scheduler.clone());

        initializer.initialize_event_subscribers().await;
        let (chat_conn, ctx, event_mapper, manager) = initializer
            .initialize_dependencies(streamer_id, app_handle.clone(), db.clone())
            .await?;
        self.addon_manager = manager;

        initializer
            .initialize_metadata_manager(&mut self.metadata_manager, streamer_id, app_handle, db)
            .await?;

        self.addon_manager.start_event_listener().await;

        let event_task = task_scheduler
            .start_processing_tasks(
                chat_conn,
                event_mapper,
                self.addon_manager.clone(),
                ctx,
                streamer_id,
            )
            .await?;

        self.finalize_startup(event_task);

        // 채널 및 시스템 초기화 완료 알림
        self.event_bus.publish(SystemEvent::SystemStarted).await;

        Ok(())
    }

    fn validate_not_running(&self) -> Result<()> {
        if self.status == SystemStatus::Running {
            return Err(anyhow::anyhow!("이미 실행 중입니다."));
        }
        Ok(())
    }

    fn finalize_startup(&mut self, event_task: JoinHandle<()>) {
        self.listener_task = Some(event_task);
        self.status = SystemStatus::Running;
    }

    pub async fn stop(&mut self, app_handle: AppHandle, db: Arc<DBService>) -> Result<()> {
        // 이미 정지상태인 경우, 무시
        if self.status == SystemStatus::Idle {
            return Ok(());
        }
        // 처리
        if let Some(task) = self.listener_task.take() {
            task.abort();
        }
        self.scheduler.cancel_all().await;

        // 애드온 정리
        let ctx = AddonContext {
            app_handle,
            db,
            broadcast_metadata: self.metadata_manager.get_metadata().await?,
        };
        self.addon_manager.stop_all(&ctx).await;

        self.status = SystemStatus::Idle;
        self.metadata_manager.stop().await;

        self.event_bus.publish(SystemEvent::SystemStopped).await;
        Ok(())
    }
}
