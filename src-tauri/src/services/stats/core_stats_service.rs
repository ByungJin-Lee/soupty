use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::{DateTime, Utc, Duration};

use super::models::*;
use super::stats_trait::Stats;

pub struct CoreStatsService {
    chat_data: Arc<RwLock<Vec<EnrichedChatData>>>,
    donation_data: Arc<RwLock<Vec<EnrichedDonationData>>>,
    time_window_minutes: u32,
    stats_processors: Vec<Box<dyn Stats>>,
}

impl CoreStatsService {
    pub fn new(time_window_minutes: u32) -> Self {
        Self {
            chat_data: Arc::new(RwLock::new(Vec::new())),
            donation_data: Arc::new(RwLock::new(Vec::new())),
            time_window_minutes,
            stats_processors: Vec::new(),
        }
    }

    pub fn add_stats_processor(&mut self, processor: Box<dyn Stats>) {
        self.stats_processors.push(processor);
    }

    pub async fn dispatch_stats_evaluation(&self) {
        for processor in &self.stats_processors {
            processor.evaluate(&self.chat_data, &self.donation_data, self.time_window_minutes).await;
        }
    }

    pub async fn record_chat_data(&self, data: EnrichedChatData) {
        let mut chat_data = self.chat_data.write().await;
        self.cleanup_old_data(&mut chat_data, data.timestamp).await;
        chat_data.push(data);
    }

    pub async fn record_donation_data(&self, data: EnrichedDonationData) {
        let mut donation_data = self.donation_data.write().await;
        self.cleanup_old_data(&mut donation_data, data.timestamp).await;
        donation_data.push(data);
    }




    async fn cleanup_old_data<T>(&self, data: &mut Vec<T>, current_time: DateTime<Utc>) 
    where
        T: HasTimestamp,
    {
        let cutoff_time = current_time - Duration::minutes(self.time_window_minutes as i64);
        data.retain(|item| item.get_timestamp() >= cutoff_time);
    }
}

trait HasTimestamp {
    fn get_timestamp(&self) -> DateTime<Utc>;
}

impl HasTimestamp for EnrichedChatData {
    fn get_timestamp(&self) -> DateTime<Utc> {
        self.timestamp
    }
}

impl HasTimestamp for EnrichedDonationData {
    fn get_timestamp(&self) -> DateTime<Utc> {
        self.timestamp
    }
}

