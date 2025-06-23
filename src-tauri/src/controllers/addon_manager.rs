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
                DomainEvent::Chat(e) => addon.on_chat(context, e).await,
                // ... 다른 이벤트 타입에 대한 분배 로직 ...
            }
        }
    }
}
