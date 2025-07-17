use std::collections::HashMap;
use std::sync::Arc;

use tokio::sync::mpsc;

use crate::services::addons::interface::{BroadcastMetadata, AddonContext};

#[derive(Debug, Clone)]
pub enum SystemEvent {
    // Metadata events
    MetadataUpdated {
        metadata: BroadcastMetadata,
        context: AddonContext,
    },
    MetadataFetchFailed(String), 
    
    // System lifecycle events
    SystemStarted,
    SystemStopping,
    SystemStopped,
    
    // Timer events
    DonationFlushRequested,
    MetadataUpdateRequested,
    
    // Error events
    ComponentError {
        component: String,
        error: String,
    },
}

pub type EventReceiver = mpsc::UnboundedReceiver<SystemEvent>;
pub type EventSender = mpsc::UnboundedSender<SystemEvent>;

pub struct EventBus {
    channels: HashMap<String, Vec<EventSender>>,
}

impl EventBus {
    pub fn new() -> Self {
        Self {
            channels: HashMap::new(),
        }
    }
    
    pub fn subscribe(&mut self, subscriber_id: &str) -> EventReceiver {
        let (sender, receiver) = mpsc::unbounded_channel();
        
        self.channels
            .entry(subscriber_id.to_string())
            .or_insert_with(Vec::new)
            .push(sender);
            
        receiver
    }
    
    pub fn publish(&self, event: SystemEvent) {
        for senders in self.channels.values() {
            for sender in senders {
                // Ignore send errors - subscriber might have been dropped
                let _ = sender.send(event.clone());
            }
        }
    }
    
    pub fn unsubscribe(&mut self, subscriber_id: &str) {
        self.channels.remove(subscriber_id);
    }
    
    pub fn subscriber_count(&self) -> usize {
        self.channels.len()
    }
}

impl Default for EventBus {
    fn default() -> Self {
        Self::new()
    }
}

// Event Bus Manager - Thread-safe wrapper
pub struct EventBusManager {
    bus: Arc<tokio::sync::Mutex<EventBus>>,
}

impl EventBusManager {
    pub fn new() -> Self {
        Self {
            bus: Arc::new(tokio::sync::Mutex::new(EventBus::new())),
        }
    }
    
    pub async fn subscribe(&self, subscriber_id: &str) -> EventReceiver {
        let mut bus = self.bus.lock().await;
        bus.subscribe(subscriber_id)
    }
    
    pub async fn publish(&self, event: SystemEvent) {
        let bus = self.bus.lock().await;
        bus.publish(event);
    }
    
    pub async fn unsubscribe(&self, subscriber_id: &str) {
        let mut bus = self.bus.lock().await;
        bus.unsubscribe(subscriber_id);
    }
    
    pub async fn subscriber_count(&self) -> usize {
        let bus = self.bus.lock().await;
        bus.subscriber_count()
    }
}

impl Default for EventBusManager {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for EventBusManager {
    fn clone(&self) -> Self {
        Self {
            bus: Arc::clone(&self.bus),
        }
    }
}