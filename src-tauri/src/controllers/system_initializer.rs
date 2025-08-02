use std::sync::Arc;

use anyhow::Result;
use soup_sdk::{
    chat::{SoopChatConnection, SoopChatOptions},
    SoopHttpClient,
};
use tauri::{async_runtime::spawn, AppHandle};
use tokio::sync::Mutex;

use crate::{
    controllers::{
        addon_manager::AddonManager,
        config::metadata_update_duration,
        constants::{MAIN_CONTROLLER_SUBSCRIBER, METADATA_UPDATE_TASK},
        event_bus::{EventBusManager, SystemEvent},
        metadata_manager::MetadataManager,
        scheduler::Scheduler,
    },
    services::{
        addons::{
            data_enrichment::DataEnrichmentAddon,
            db_logger::DBLoggerAddon,
            default_ui::DefaultUIAddon,
            interface::{AddonContext, BroadcastMetadata},
        },
        db::service::DBService,
        event_mapper::EventMapper,
    },
};

pub struct SystemInitializer {
    event_bus: EventBusManager,
    scheduler: Scheduler,
}

impl SystemInitializer {
    pub fn new(event_bus: EventBusManager, scheduler: Scheduler) -> Self {
        Self {
            event_bus,
            scheduler,
        }
    }

    pub async fn initialize_event_subscribers(&self) {
        // Subscribe to system events for error handling
        let mut receiver = self.event_bus.subscribe(MAIN_CONTROLLER_SUBSCRIBER).await;
        let event_bus = self.event_bus.clone();

        spawn(async move {
            while let Some(event) = receiver.recv().await {
                match event {
                    SystemEvent::MetadataFetchFailed(error) => {
                        eprintln!("Metadata fetch failed: {}", error);
                        // Could trigger system stop
                        event_bus.publish(SystemEvent::SystemStopping).await;
                    }
                    SystemEvent::SystemStopping => {
                        // Handle system stopping
                        break;
                    }
                    _ => {}
                }
            }
        });
    }

    pub async fn initialize_dependencies(
        &self,
        streamer_id: &str,
        app_handle: AppHandle,
        db: Arc<DBService>,
    ) -> Result<(
        SoopChatConnection,
        AddonContext,
        Arc<Mutex<EventMapper>>,
        AddonManager,
    )> {
        // Chat connection 설정
        let soop_client = SoopHttpClient::new();
        let chat_conn = SoopChatConnection::new(
            Arc::new(soop_client),
            SoopChatOptions {
                streamer_id: streamer_id.to_string(),
            },
        )?;

        // Initialize addon manager
        let addon_manager = self.initialize_addon_manager(app_handle.clone());

        // 컨텍스트 생성 (temporary - will be updated after metadata initialization)
        let ctx = AddonContext {
            app_handle,
            db,
            broadcast_metadata: None,
        };

        // 매니저와 매퍼 준비
        let event_mapper = Arc::new(Mutex::new(EventMapper::new()));

        // Don't start chat_conn yet - wait until all initialization is complete
        Ok((chat_conn, ctx, event_mapper, addon_manager))
    }

    fn initialize_addon_manager(&self, app_handle: AppHandle) -> AddonManager {
        let addon_manager = AddonManager::new()
            .with_event_bus(self.event_bus.clone())
            .with_app_handle(app_handle.clone());

        // Addon 등록
        addon_manager.register(Arc::new(DefaultUIAddon::new()));
        addon_manager.register(Arc::new(DBLoggerAddon::new()));
        addon_manager.register(Arc::new(DataEnrichmentAddon::new(app_handle.clone())));

        addon_manager
    }

    pub async fn initialize_metadata_manager(
        &self,
        metadata_manager: &mut MetadataManager,
        streamer_id: &str,
        app_handle: AppHandle,
        db: Arc<DBService>,
    ) -> Result<()> {
        metadata_manager.initialize(streamer_id).await?;
        let event_bus = self.event_bus.clone();
        let metadata_manager_clone = metadata_manager.clone();

        // 초기 메타데이터 설정 알림
        let app_handle_clone = app_handle.clone();
        let db_clone = db.clone();
        metadata_manager
            .notify_initial_metadata(move |metadata: &BroadcastMetadata| {
                let event_bus_clone = event_bus.clone();
                let metadata_clone = metadata.clone();
                let app_handle_clone2 = app_handle_clone.clone();
                let db_clone2 = db_clone.clone();

                async move {
                    let context = AddonContext {
                        app_handle: app_handle_clone2,
                        db: db_clone2,
                        broadcast_metadata: Some(metadata_clone.clone()),
                    };
                    event_bus_clone
                        .publish(SystemEvent::MetadataUpdated {
                            metadata: metadata_clone,
                            context,
                        })
                        .await;
                }
            })
            .await;

        // 메타데이터 업데이터 설정
        let event_bus_clone = self.event_bus.clone();
        let app_handle_clone2 = app_handle.clone();
        let db_clone2 = db.clone();

        self.scheduler
            .schedule_recurring(
                METADATA_UPDATE_TASK,
                metadata_update_duration(),
                move || {
                    let event_bus = event_bus_clone.clone();
                    let mut metadata_manager = metadata_manager_clone.clone();
                    let app_handle_clone3 = app_handle_clone2.clone();
                    let db_clone3 = db_clone2.clone();

                    async move {
                        let event_bus_for_error = event_bus.clone();
                        match metadata_manager
                            .update_metadata(move |metadata: &BroadcastMetadata| {
                                let event_bus_clone = event_bus.clone();
                                let metadata_clone = metadata.clone();
                                let app_handle_clone4 = app_handle_clone3.clone();
                                let db_clone4 = db_clone3.clone();

                                async move {
                                    let context = AddonContext {
                                        app_handle: app_handle_clone4,
                                        db: db_clone4,
                                        broadcast_metadata: Some(metadata_clone.clone()),
                                    };
                                    event_bus_clone
                                        .publish(SystemEvent::MetadataUpdated {
                                            metadata: metadata_clone,
                                            context,
                                        })
                                        .await;
                                }
                            })
                            .await
                        {
                            Ok(()) => {
                                // Metadata updated successfully
                            }
                            Err(error) => {
                                // 오류가 난 경우 방송 종료로 간주함.
                                event_bus_for_error
                                    .publish(SystemEvent::MetadataFetchFailed(error.to_string()))
                                    .await;
                            }
                        }
                    }
                },
            )
            .await;

        Ok(())
    }
}
