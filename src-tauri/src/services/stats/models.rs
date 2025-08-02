use chrono::{DateTime, Utc};
use serde::Serialize;
use soup_sdk::chat::types::User;
use uuid::Uuid;

use crate::services::ai::sentiment_analyzer::AnalysisResult;

#[derive(Debug, Clone, Serialize)]
pub struct EnrichedChatData {
    pub event_id: Uuid,
    pub channel_id: String,
    pub user: User,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub tokens: Vec<String>,
    pub word_count: usize,
    pub character_count: usize,
    pub is_lol: bool,
    pub sentiment_analysis: Option<AnalysisResult>,
}

#[derive(Debug, Clone, Serialize)]
pub struct EnrichedDonationData {
    pub event_id: Uuid,
    pub channel_id: String,
    pub user_id: String,
    pub user_name: String,
    pub amount: u32,
    pub message: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub message_tokens: Vec<String>,
}

pub trait HasTimestamp {
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
