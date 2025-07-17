use std::sync::Arc;

use crate::{models::events::*, services::db::service::DBService};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::Serialize;
use tauri::AppHandle;

#[derive(Clone, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BroadcastMetadata {
    pub channel_id: String,
    pub title: String,
    pub started_at: DateTime<Utc>,
    pub viewer_count: u64,
    pub timestamp: DateTime<Utc>,
}

#[derive(Clone, Debug)]
pub struct AddonContext {
    pub app_handle: AppHandle,
    pub db: Arc<DBService>,
    pub broadcast_metadata: Option<BroadcastMetadata>,
}

#[async_trait]
pub trait Addon: Send + Sync {
    fn name(&self) -> &'static str;

    // 생명 주기 이벤트
    async fn on_connected(&self, _ctx: &AddonContext) {}
    async fn on_disconnected(&self, _ctx: &AddonContext) {}
    async fn on_metadata_update(&self, _ctx: &AddonContext, _event: &MetadataEvent) {}
    async fn stop(&self, _ctx: &AddonContext) {}

    // 채팅 관련 이벤트 핸들러
    async fn on_bj_state_change(&self, _ctx: &AddonContext) {}
    async fn on_chat(&self, _ctx: &AddonContext, _event: &ChatEvent) {}
    async fn on_donation(&self, _ctx: &AddonContext, _event: &DonationEvent) {}
    async fn on_subscribe(&self, _ctx: &AddonContext, _event: &SubscribeEvent) {}
    // async fn on_kick(&self, _ctx: &AddonContext, _event: &UserEvent) {}
    async fn on_kick_cancel(&self, _ctx: &AddonContext, _event: &SimplifiedUserEvent) {}
    async fn on_mute(&self, _ctx: &AddonContext, _event: &MuteEvent) {}
    async fn on_black(&self, _ctx: &AddonContext, _event: &SimplifiedUserEvent) {}
    async fn on_freeze(&self, _ctx: &AddonContext, _event: &FreezeEvent) {}
    async fn on_notification(&self, _ctx: &AddonContext, _event: &NotificationEvent) {}
    async fn on_mission_donation(&self, _ctx: &AddonContext, _event: &MissionEvent) {}
    async fn on_mission_total(&self, _ctx: &AddonContext, _event: &MissionTotalEvent) {}
    async fn on_battle_mission_result(
        &self,
        _ctx: &AddonContext,
        _event: &BattleMissionResultEvent,
    ) {
    }
    async fn on_challenge_mission_result(
        &self,
        _ctx: &AddonContext,
        _event: &ChallengeMissionResultEvent,
    ) {
    }
    async fn on_slow(&self, _ctx: &AddonContext, _event: &SlowEvent) {}
}
