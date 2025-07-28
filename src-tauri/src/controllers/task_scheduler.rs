use std::sync::Arc;

use anyhow::Result;
use soup_sdk::chat::SoopChatConnection;
use tauri::async_runtime::{spawn, JoinHandle};
use tokio::sync::Mutex;

use crate::{
    controllers::{
        addon_manager::AddonManager, config::timer_tick_duration, constants::DONATION_FLUSH_TASK,
        donation_timer::DonationTimer, scheduler::Scheduler,
    },
    services::{addons::interface::AddonContext, event_mapper::EventMapper},
};

pub struct TaskScheduler {
    scheduler: Scheduler,
}

impl TaskScheduler {
    pub fn new(scheduler: Scheduler) -> Self {
        Self { scheduler }
    }

    pub async fn start_processing_tasks(
        &self,
        chat_conn: SoopChatConnection,
        event_mapper: Arc<Mutex<EventMapper>>,
        manager: AddonManager,
        ctx: AddonContext,
        streamer_id: &str,
    ) -> Result<JoinHandle<()>> {
        let channel_id = streamer_id.to_string();

        // 도네이션 타이머 생성
        let donation_event_mapper = event_mapper.clone();
        let donation_manager = manager.clone();
        let donation_ctx = ctx.clone();

        self.scheduler
            .schedule_recurring(DONATION_FLUSH_TASK, timer_tick_duration(), move || {
                let event_mapper = donation_event_mapper.clone();
                let manager = donation_manager.clone();
                let ctx = donation_ctx.clone();

                async move {
                    DonationTimer::process_donations(&event_mapper, &manager, &ctx).await;
                }
            })
            .await;

        // conn의 size가 초과되지 않도록 늦게 conn을 start 한다.
        chat_conn.start().await?;

        // 이벤트 처리 태스크 - connection 시작 후에 생성
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
                            event_task_manager
                                .dispatch(&event_task_ctx, &domain_event)
                                .await;
                        }
                    }
                    Err(e) => {
                        log::error!("Event bus error: {:?}", e);
                        break;
                    }
                }
            }
        });

        Ok(event_task)
    }
}
