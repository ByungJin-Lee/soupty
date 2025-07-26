use async_trait::async_trait;
use tauri::Emitter;

use crate::{
    models::events::*,
    services::{
        addons::interface::{Addon, AddonContext},
        event_name,
    },
};

pub struct DefaultUIAddon {}

impl DefaultUIAddon {
    pub fn new() -> Self {
        Self {}
    }
}

#[async_trait]
impl Addon for DefaultUIAddon {
    fn name(&self) -> &'static str {
        "default-ui-addon"
    }

    // 생명 주기 이벤트
    async fn on_connected(&self, ctx: &AddonContext) {
        let _ = ctx
            .app_handle
            .emit(event_name::LOG_EVENT, DomainEvent::Connected);
    }

    async fn on_disconnected(&self, ctx: &AddonContext) {
        let _ = ctx
            .app_handle
            .emit(event_name::LOG_EVENT, DomainEvent::Disconnected);
    }

    // 채팅 관련 이벤트
    async fn on_bj_state_change(&self, ctx: &AddonContext) {
        let _ = ctx
            .app_handle
            .emit(event_name::LOG_EVENT, DomainEvent::BJStateChange);
    }

    async fn on_chat(&self, ctx: &AddonContext, event: &ChatEvent) {
        let _ = ctx.app_handle.emit(event_name::LOG_CHAT, event);
    }

    async fn on_donation(&self, ctx: &AddonContext, event: &DonationEvent) {
        let domain_event = DomainEvent::Donation(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_subscribe(&self, ctx: &AddonContext, event: &SubscribeEvent) {
        let domain_event = DomainEvent::Subscribe(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    // async fn on_kick(&self, ctx: &AddonContext, event: &UserEvent) {
    //     let domain_event = DomainEvent::Kick(event.clone());
    //     let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    // }

    async fn on_kick_cancel(&self, ctx: &AddonContext, event: &SimplifiedUserEvent) {
        let domain_event = DomainEvent::KickCancel(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_mute(&self, ctx: &AddonContext, event: &MuteEvent) {
        let domain_event = DomainEvent::Mute(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_black(&self, ctx: &AddonContext, event: &SimplifiedUserEvent) {
        let domain_event = DomainEvent::Black(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_freeze(&self, ctx: &AddonContext, event: &FreezeEvent) {
        let domain_event = DomainEvent::Freeze(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_notification(&self, ctx: &AddonContext, event: &NotificationEvent) {
        let domain_event = DomainEvent::Notification(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_mission_donation(&self, ctx: &AddonContext, event: &MissionEvent) {
        let domain_event = DomainEvent::MissionDonation(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_mission_total(&self, ctx: &AddonContext, event: &MissionTotalEvent) {
        let domain_event = DomainEvent::MissionTotal(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_battle_mission_result(&self, ctx: &AddonContext, event: &BattleMissionResultEvent) {
        let domain_event = DomainEvent::BattleMissionResult(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_challenge_mission_result(
        &self,
        ctx: &AddonContext,
        event: &ChallengeMissionResultEvent,
    ) {
        let domain_event = DomainEvent::ChallengeMissionResult(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_slow(&self, ctx: &AddonContext, event: &SlowEvent) {
        let domain_event = DomainEvent::Slow(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }

    async fn on_metadata_update(&self, ctx: &AddonContext, event: &MetadataEvent) {
        let domain_event = DomainEvent::MetadataUpdate(event.clone());
        let _ = ctx.app_handle.emit(event_name::LOG_EVENT, domain_event);
    }
}
