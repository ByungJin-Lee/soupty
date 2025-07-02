use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use crate::{
    models::events::DomainEvent,
    services::addons::interface::{Addon, AddonContext},
};

#[derive(Default, Clone)]
pub struct AddonManager {
    addons: Arc<Mutex<HashMap<String, Arc<dyn Addon>>>>,
}

impl AddonManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn register(&self, addon: Arc<dyn Addon>) {
        let mut addons = self.addons.lock().unwrap();
        let name = addon.name();
        addons.insert(name.to_string(), addon);
        println!("[AddonManager] '{}' 애드온이 등록되었습니다.", name);
    }

    pub fn unregister(&self, name: &str) {
        let mut addons = self.addons.lock().unwrap();
        if addons.remove(name).is_some() {
            println!("[AddonManager] '{}' 애드온이 해제되었습니다.", name);
        }
    }

    // 이벤트를 모든 구독자에게 분배(dispatch)합니다.
    pub async fn dispatch(&self, context: &AddonContext, event: &DomainEvent) {
        let addons_clone = self.addons.lock().unwrap().clone();
        for addon in addons_clone.values() {
            match event {
                // 생명 주기 이벤트
                DomainEvent::Connected => addon.on_connected(context).await,
                DomainEvent::Disconnected => addon.on_disconnected(context).await,

                // 채팅 관련 이벤트
                DomainEvent::BJStateChange => addon.on_bj_state_change(context).await,
                DomainEvent::Chat(e) => addon.on_chat(context, e).await,
                DomainEvent::Donation(e) => addon.on_donation(context, e).await,
                DomainEvent::Subscribe(e) => addon.on_subscribe(context, e).await,

                // DomainEvent::Kick(e) => addon.on_kick(context, e).await,
                DomainEvent::KickCancel(e) => addon.on_kick_cancel(context, e).await,
                DomainEvent::Mute(e) => addon.on_mute(context, e).await,
                DomainEvent::Black(e) => addon.on_black(context, e).await,
                DomainEvent::Freeze(e) => addon.on_freeze(context, e).await,
                DomainEvent::Notification(e) => addon.on_notification(context, e).await,

                DomainEvent::MissionDonation(e) => addon.on_mission_donation(context, e).await,
                DomainEvent::MissionTotal(e) => addon.on_mission_total(context, e).await,
                DomainEvent::BattleMissionResult(e) => {
                    addon.on_battle_mission_result(context, e).await
                }
                DomainEvent::ChallengeMissionResult(e) => {
                    addon.on_challenge_mission_result(context, e).await
                }
                DomainEvent::Slow(e) => addon.on_slow(context, e).await,
            }
        }
    }

    // 메타데이터 업데이트를 모든 애드온에게 알림
    pub async fn notify_metadata_update(&self, context: &AddonContext) {
        let addons_clone = self.addons.lock().unwrap().clone();
        for addon in addons_clone.values() {
            addon.on_metadata_update(context).await;
        }
    }
}
