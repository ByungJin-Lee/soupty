use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use tauri::async_runtime::spawn;
use uuid::Uuid;

use crate::{
    controllers::{
        constants::ADDON_MANAGER_SUBSCRIBER,
        event_bus::{EventBusManager, SystemEvent},
    },
    models::events::{DomainEvent, MetadataEvent},
    services::addons::interface::{Addon, AddonContext},
};

#[derive(Clone)]
pub struct AddonManager {
    addons: Arc<Mutex<HashMap<String, Arc<dyn Addon>>>>,
    event_bus: Option<EventBusManager>,
}

impl Default for AddonManager {
    fn default() -> Self {
        Self::new()
    }
}

impl AddonManager {
    pub fn new() -> Self {
        Self {
            addons: Arc::new(Mutex::new(HashMap::new())),
            event_bus: None,
        }
    }

    pub fn with_event_bus(mut self, event_bus: EventBusManager) -> Self {
        self.event_bus = Some(event_bus);
        self
    }

    pub async fn start_event_listener(&self) {
        if let Some(event_bus) = &self.event_bus {
            let mut receiver = event_bus.subscribe(ADDON_MANAGER_SUBSCRIBER).await;
            let addons = self.addons.clone();

            spawn(async move {
                while let Some(event) = receiver.recv().await {
                    match event {
                        SystemEvent::MetadataUpdated { metadata, context } => {
                            let addons_clone = addons.lock().unwrap().clone();
                            for addon in addons_clone.values() {
                                let event = MetadataEvent {
                                    title: metadata.title.clone(),
                                    started_at: metadata.started_at,
                                    viewer_count: metadata.viewer_count,
                                    timestamp: metadata.timestamp,
                                    channel_id: metadata.channel_id.clone(),
                                    id: Uuid::new_v4(),
                                };

                                addon.on_metadata_update(&context, &event).await;
                            }
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
    }

    pub fn register(&self, addon: Arc<dyn Addon>) {
        let mut addons = self.addons.lock().unwrap();
        let name = addon.name();
        addons.insert(name.to_string(), addon);
        println!("[AddonManager] '{}' 애드온이 등록되었습니다.", name);
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

                DomainEvent::Kick(e) => addon.on_kick(context, e).await,
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
                _ => {
                    log::warn!("Unhandled event: {:?}", event);
                }
            }
        }
    }

    // 모든 애드온의 stop 메서드 호출하여 정리
    pub async fn stop_all(&self, context: &AddonContext) {
        let addons_clone = self.addons.lock().unwrap().clone();
        for addon in addons_clone.values() {
            addon.stop(context).await;
        }
        println!("[AddonManager] 모든 애드온이 정리되었습니다.");
    }
}
