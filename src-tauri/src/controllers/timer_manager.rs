use std::sync::Arc;

use tauri::async_runtime::{spawn, JoinHandle};
use tokio::sync::Mutex;

use crate::{
    controllers::{
        addon_manager::AddonManager,
        config::{metadata_update_ticks, timer_tick_duration},
        metadata_manager::MetadataManager,
    },
    services::{
        addons::interface::AddonContext,
        event_mapper::EventMapper,
    },
};

pub struct TimerManager;

impl TimerManager {
    pub fn start_unified_timer(
        event_mapper: Arc<Mutex<EventMapper>>,
        manager: AddonManager,
        ctx: AddonContext,
        channel_id: String,
    ) -> JoinHandle<()> {
        spawn(async move {
            let mut interval = tokio::time::interval(timer_tick_duration());
            let mut tick_count = 0u64;
            
            // 메타데이터 업데이트 주기 계산
            let metadata_ticks = metadata_update_ticks();
            
            loop {
                interval.tick().await;
                tick_count += 1;
                
                // 매 틱마다 도네이션 처리
                Self::process_donations(&event_mapper, &manager, &ctx).await;
                
                // 지정된 주기마다 메타데이터 업데이트
                if tick_count % metadata_ticks == 0 {
                    Self::update_metadata(&manager, &ctx, &channel_id).await;
                }
            }
        })
    }
    
    async fn process_donations(
        event_mapper: &Arc<Mutex<EventMapper>>,
        manager: &AddonManager,
        ctx: &AddonContext,
    ) {
        let expired_donations = {
            let mut mapper = event_mapper.lock().await;
            mapper.flush_expired_donations()
        };
        
        for donation_event in expired_donations {
            manager.dispatch(ctx, &donation_event).await;
        }
    }
    
    async fn update_metadata(
        manager: &AddonManager,
        ctx: &AddonContext,
        channel_id: &str,
    ) {
        match MetadataManager::update_viewer_count(channel_id).await {
            Ok(viewer_count) => {
                // 기존 메타데이터 업데이트
                let mut updated_ctx = ctx.clone();
                if let Some(ref mut metadata) = updated_ctx.broadcast_metadata {
                    metadata.viewer_count = viewer_count;
                }
                
                // Addon들에게 업데이트 알림
                manager.notify_metadata_update(&updated_ctx).await;
            }
            Err(e) => {
                log::error!("Failed to update metadata: {:?}", e);
            }
        }
    }
}