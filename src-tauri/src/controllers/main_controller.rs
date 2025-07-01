use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use soup_sdk::{
    chat::{SoopChatConnection, SoopChatOptions},
    SoopHttpClient,
};
use tauri::{
    async_runtime::{spawn, JoinHandle},
    AppHandle,
};
use tokio::sync::Mutex;

use crate::{
    controllers::addon_manager::AddonManager,
    services::{
        addons::{db_logger::DBLoggerAddon, default_ui::DefaultUIAddon, interface::{AddonContext, BroadcastMetadata}},
        db::service::DBService,
        event_mapper::{EventMapper, DONATION_FLUSH_INTERVAL_MS},
    },
};

#[derive(PartialEq)]
pub enum SystemStatus {
    Idle,
    Running,
}

pub struct MainController {
    listener_task: Option<JoinHandle<()>>,
    timer_task: Option<JoinHandle<()>>,
    addon_manager: AddonManager,
    pub status: SystemStatus,
}

impl MainController {
    pub fn new() -> Self {
        Self {
            addon_manager: AddonManager::new(),
            status: SystemStatus::Idle,
            listener_task: None,
            timer_task: None,
        }
    }

    pub async fn start(
        &mut self,
        streamer_id: &str,
        app_handle: AppHandle,
        db: Arc<DBService>,
    ) -> Result<()> {
        self.validate_not_running()?;
        let (chat_conn, ctx, event_mapper, manager) = self.initialize_dependencies(streamer_id, app_handle, db).await?;
        let (event_task, timer_task) = self.start_processing_tasks(chat_conn, event_mapper, manager, ctx, streamer_id).await?;
        self.finalize_startup(event_task, timer_task);
        Ok(())
    }

    fn validate_not_running(&self) -> Result<()> {
        if self.status == SystemStatus::Running {
            return Err(anyhow::anyhow!("이미 실행 중입니다."));
        }
        Ok(())
    }

    async fn initialize_dependencies(
        &mut self,
        streamer_id: &str,
        app_handle: AppHandle,
        db: Arc<DBService>,
    ) -> Result<(SoopChatConnection, AddonContext, Arc<Mutex<EventMapper>>, AddonManager)> {
        // Chat connection 설정
        let soop_client = SoopHttpClient::new();
        let chat_conn = SoopChatConnection::new(
            Arc::new(soop_client),
            SoopChatOptions {
                streamer_id: streamer_id.to_string(),
            },
        )?;

        // 방송 메타데이터 가져오기
        let broadcast_metadata = self.fetch_broadcast_metadata(streamer_id).await?;

        // 컨텍스트 생성
        let ctx = AddonContext { 
            app_handle, 
            db,
            broadcast_metadata: Some(broadcast_metadata),
        };

        // Addon 등록
        self.addon_manager.register(Arc::new(DefaultUIAddon::new()));
        self.addon_manager.register(Arc::new(DBLoggerAddon::new()));

        // 매니저와 매퍼 준비
        let manager = self.addon_manager.clone();
        let event_mapper = Arc::new(Mutex::new(EventMapper::new()));

        chat_conn.start().await?;

        Ok((chat_conn, ctx, event_mapper, manager))
    }

    async fn start_processing_tasks(
        &self,
        chat_conn: SoopChatConnection,
        event_mapper: Arc<Mutex<EventMapper>>,
        manager: AddonManager,
        ctx: AddonContext,
        streamer_id: &str,
    ) -> Result<(JoinHandle<()>, JoinHandle<()>)> {
        let channel_id = streamer_id.to_string();

        // 이벤트 처리 태스크
        let event_task_mapper = event_mapper.clone();
        let event_task_manager = manager.clone();
        let event_task_ctx = ctx.clone();
        let event_task_channel_id = channel_id.clone();
        let event_task = spawn(async move {
            let mut event_bus = chat_conn.subscribe();
            loop {
                match event_bus.recv().await {
                    Ok(e) => {
                        let event = {
                            let mut mapper = event_task_mapper.lock().await;
                            mapper.process_event(&event_task_channel_id, &e)
                        };
                        
                        if let Some(domain_event) = event {
                            event_task_manager.dispatch(&event_task_ctx, &domain_event).await;
                        }
                    }
                    Err(e) => {
                        log::error!("Event bus error: {:?}", e);
                        break;
                    }
                }
            }
        });

        // 타이머 태스크 (donation 처리)
        let timer_task_mapper = event_mapper;
        let timer_task_manager = manager;
        let timer_task_ctx = ctx;
        let timer_task = spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_millis(DONATION_FLUSH_INTERVAL_MS));
            loop {
                interval.tick().await;
                let expired_donations = {
                    let mut mapper = timer_task_mapper.lock().await;
                    mapper.flush_expired_donations()
                };
                
                for donation_event in expired_donations {
                    timer_task_manager.dispatch(&timer_task_ctx, &donation_event).await;
                }
            }
        });

        Ok((event_task, timer_task))
    }

    fn finalize_startup(&mut self, event_task: JoinHandle<()>, timer_task: JoinHandle<()>) {
        self.listener_task = Some(event_task);
        self.timer_task = Some(timer_task);
        self.status = SystemStatus::Running;
    }

    pub fn stop(&mut self) {
        // 이미 정지상태인 경우, 무시
        if self.status == SystemStatus::Idle {
            return;
        }
        // 처리
        if let Some(task) = self.listener_task.take() {
            task.abort();
        }
        if let Some(timer) = self.timer_task.take() {
            timer.abort();
        }
        self.status = SystemStatus::Idle;
    }

    async fn fetch_broadcast_metadata(&self, streamer_id: &str) -> Result<BroadcastMetadata> {
        let soop_client = SoopHttpClient::new();
        
        // Station 데이터에서 broad_start 가져오기
        let station = soop_client.get_station(streamer_id).await?;
        
        // Live 데이터에서 title 가져오기
        let (_, live) = soop_client.get_live_detail_state(streamer_id).await?;
        
        // broad_start를 DateTime<Utc>로 파싱 (YYYY-MM-DD HH:MM:SS 형식)
        let started_at = chrono::NaiveDateTime::parse_from_str(&station.broad_start, "%Y-%m-%d %H:%M:%S")
            .map_err(|e| anyhow::anyhow!("Failed to parse broad_start: {}", e))?
            .and_utc();
        
        Ok(BroadcastMetadata {
            channel_id: streamer_id.to_string(),
            title: live.unwrap().title,
            started_at,
        })
    }
}
