use std::time::Instant;

use crate::services::db::commands::{ChatLogData, EventLogData};

pub struct LogBuffer {
    pub chat_logs: Vec<ChatLogData>,
    pub event_logs: Vec<EventLogData>,
    pub last_flush: Instant,
}

impl Default for LogBuffer {
    fn default() -> Self {
        Self {
            chat_logs: Vec::new(),
            event_logs: Vec::new(),
            last_flush: Instant::now(),
        }
    }
}

impl LogBuffer {
    pub fn clear(&mut self) {
        self.chat_logs.clear();
        self.event_logs.clear();
        self.last_flush = Instant::now();
    }

    pub fn total_entries(&self) -> usize {
        self.chat_logs.len() + self.event_logs.len()
    }
}
