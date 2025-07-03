use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichedChatData {
    pub event_id: Uuid,
    pub channel_id: String,
    pub user_id: String,
    pub user_name: String,
    pub message: String,
    pub timestamp: DateTime<Utc>,
    pub tokens: Vec<String>,
    pub word_count: usize,
    pub character_count: usize,
    pub is_lol: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichedDonationData {
    pub event_id: Uuid,
    pub channel_id: String,
    pub user_id: String,
    pub user_name: String,
    pub amount: u32,
    pub message: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub message_tokens: Vec<String>
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichedSubscribeData {
    pub event_id: Uuid,
    pub channel_id: String,
    pub user_id: String,
    pub user_name: String,
    pub timestamp: DateTime<Utc>,
    pub subscription_tier: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrichedModerationData {
    pub event_id: Uuid,
    pub channel_id: String,
    pub user_id: String,
    pub user_name: String,
    pub moderator_id: String,
    pub moderator_name: String,
    pub action_type: String,
    pub timestamp: DateTime<Utc>,
    pub severity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMetrics {
    pub total_messages: u64,
    pub unique_users: u64,
    pub messages_per_minute: f64,
    pub average_message_length: f64,
    pub question_rate: f64,
    pub emoji_usage_rate: f64,
    pub url_share_rate: f64,
    pub top_users: Vec<UserActivity>,
    pub language_distribution: Vec<LanguageStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DonationMetrics {
    pub total_donations: u64,
    pub total_amount: f64,
    pub average_donation: f64,
    pub unique_donors: u64,
    pub donations_per_hour: f64,
    pub milestone_donations: u64,
    pub tier_distribution: Vec<TierStats>,
    pub top_donors: Vec<DonorActivity>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngagementMetrics {
    pub total_events: u64,
    pub engagement_rate: f64,
    pub peak_activity_hour: u8,
    pub user_retention_rate: f64,
    pub new_user_rate: f64,
    pub moderation_rate: f64,
    pub subscription_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserActivity {
    pub user_id: String,
    pub user_name: String,
    pub message_count: u64,
    pub last_seen: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanguageStats {
    pub language: String,
    pub count: u64,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TierStats {
    pub tier: String,
    pub count: u64,
    pub total_amount: f64,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DonorActivity {
    pub user_id: String,
    pub user_name: String,
    pub total_donated: f64,
    pub donation_count: u64,
    pub last_donation: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeSeriesData {
    pub timestamp: DateTime<Utc>,
    pub value: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RealTimeStats {
    pub chat_metrics: ChatMetrics,
    pub donation_metrics: DonationMetrics,
    pub engagement_metrics: EngagementMetrics,
    pub last_updated: DateTime<Utc>,
    pub time_window_minutes: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatsEvent {
    pub name: String,
    pub value: f32,
}
