use std::sync::Arc;

use crate::{models::events::ChatEvent, services::db::service::DBService};
use async_trait::async_trait;
use tauri::AppHandle;

pub struct AddonContext {
    pub app_handle: AppHandle,
    pub db: Arc<DBService>,
}

#[async_trait]
pub trait Addon: Send + Sync {
    fn name(&self) -> &'static str;

    // 이벤트 핸들러
    async fn on_chat(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_donation(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_subscribe(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    // async fn on_enter(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    // async fn on_exit(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_kick(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_kick_cancel(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_mute(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_black(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_freeze(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_notification(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    // async fn on_join(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_mission(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_slow(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
}
