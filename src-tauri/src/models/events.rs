use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use soup_sdk::chat::types::{ChatType, DonationType, Emoticon, MissionType, User};

// 이벤트 타입 상수
// Lifecycle events
pub const EVENT_TYPE_CONNECTED: &str = "Connected";
pub const EVENT_TYPE_DISCONNECTED: &str = "Disconnected";
pub const EVENT_TYPE_BJ_STATE_CHANGE: &str = "BJStateChange";

// Chat related events
pub const EVENT_TYPE_CHAT: &str = "Chat";
pub const EVENT_TYPE_DONATION: &str = "Donation";
pub const EVENT_TYPE_SUBSCRIBE: &str = "Subscribe";

// User events
pub const EVENT_TYPE_ENTER: &str = "Enter";
pub const EVENT_TYPE_EXIT: &str = "Exit";

// Moderation events
pub const EVENT_TYPE_KICK: &str = "Kick";
pub const EVENT_TYPE_KICK_CANCEL: &str = "KickCancel";
pub const EVENT_TYPE_MUTE: &str = "Mute";
pub const EVENT_TYPE_BLACK: &str = "Black";
pub const EVENT_TYPE_FREEZE: &str = "Freeze";
pub const EVENT_TYPE_SLOW: &str = "Slow";

// Mission events
pub const EVENT_TYPE_MISSION_DONATION: &str = "MissionDonation";
pub const EVENT_TYPE_MISSION_TOTAL: &str = "MissionTotal";
pub const EVENT_TYPE_CHALLENGE_MISSION_RESULT: &str = "ChallengeMissionResult";
pub const EVENT_TYPE_BATTLE_MISSION_RESULT: &str = "BattleMissionResult";

// System events
pub const EVENT_TYPE_NOTIFICATION: &str = "Notification";
pub const EVENT_TYPE_METADATA_UPDATE: &str = "MetadataUpdate";

// 전처리 과정을 거친 이벤트입니다.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", content = "payload")]
pub enum DomainEvent {
    // --- 생명 주기 관련 이벤트 ---
    Connected,
    Disconnected,
    MetadataUpdate(MetadataEvent),

    // --- 채팅 관련 이벤트 ---
    BJStateChange,
    Chat(ChatEvent),
    Donation(DonationEvent),
    Subscribe(SubscribeEvent),
    Kick(UserEvent),
    KickCancel(SimplifiedUserEvent),
    Mute(MuteEvent),
    Black(SimplifiedUserEvent),
    Freeze(FreezeEvent),
    Notification(NotificationEvent),
    MissionDonation(MissionEvent),
    MissionTotal(MissionTotalEvent),
    BattleMissionResult(BattleMissionResultEvent),
    ChallengeMissionResult(ChallengeMissionResultEvent),
    Slow(SlowEvent),
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub comment: String,
    pub chat_type: ChatType,
    pub user: User,
    pub is_admin: bool,
    pub ogq: Option<Emoticon>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MetadataEvent {
    pub title: String,
    pub channel_id: String,
    pub started_at: DateTime<Utc>,
    pub viewer_count: u64,
    pub timestamp: DateTime<Utc>,
    pub id: uuid::Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DonationEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub from: String,
    pub from_label: String,
    pub amount: u32,
    pub fan_club_ordinal: u32,
    pub become_top_fan: bool,
    pub donation_type: DonationType,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MissionEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub from: String,
    pub from_label: String,
    pub amount: u32,
    pub mission_type: MissionType,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MissionTotalEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub mission_type: MissionType,
    pub amount: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChallengeMissionResultEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub is_success: bool,
    pub title: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BattleMissionResultEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub is_draw: bool,
    pub winner: String,
    pub title: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubscribeEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub user_id: String,
    pub label: String,
    pub tier: u32,
    pub renew: u32,
}

#[derive(Debug, Clone, Serialize)]
pub struct NotificationEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub message: String,
    pub show: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct UserEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub user: User,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SimplifiedUserEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub user_id: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FreezeEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub freezed: bool,
    pub limit_subscription_month: u32,
    pub limit_balloons: u32,
    pub targets: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MuteEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub user: User,
    pub seconds: u32,
    pub message: String,
    pub by: String,
    pub counts: u32,
    pub superuser_type: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct SlowEvent {
    pub id: uuid::Uuid,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub duration: u32,
}
