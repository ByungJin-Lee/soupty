use std::sync::Arc;

use tauri::async_runtime::{spawn, JoinHandle};
use tokio::sync::Mutex;

use crate::{
    controllers::{
        addon_manager::AddonManager,
        config::{timer_tick_duration},
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
    ) -> JoinHandle<()> {
        spawn(async move {
            let mut interval = tokio::time::interval(timer_tick_duration());
            
            loop {
                interval.tick().await;
                
                // 매 틱마다 도네이션 처리
                Self::process_donations(&event_mapper, &manager, &ctx).await;
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
}