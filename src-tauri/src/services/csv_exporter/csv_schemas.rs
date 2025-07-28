use chrono::{DateTime, Utc};
use serde::Serialize;
use soup_sdk::chat::types::{ChatType, DonationType, User};

#[derive(Debug, Clone, Serialize)]
pub struct ChatCsvRow {
    pub id: String,
    pub timestamp: String,
    pub channel_id: String,
    pub user_id: String,
    pub username: String,
    pub comment: String,
    pub chat_type: String,
    pub is_admin: bool,
    pub has_ogq: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct DonationCsvRow {
    pub id: String,
    pub timestamp: String,
    pub channel_id: String,
    pub from_user_id: String,
    pub from_user_name: String,
    pub amount: u32,
    pub donation_type: String,
    pub message: String,
    pub become_top_fan: bool,
    pub fan_club_ordinal: u32,
}

#[derive(Debug, Clone, Serialize)]
pub struct MuteCsvRow {
    pub id: String,
    pub timestamp: String,
    pub channel_id: String,
    pub target_user_id: String,
    pub target_username: String,
    pub seconds: u32,
    pub message: String,
    pub moderator: String,
    pub counts: u32,
    pub superuser_type: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct KickCsvRow {
    pub id: String,
    pub timestamp: String,
    pub channel_id: String,
    pub target_user_id: String,
    pub target_username: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct MetadataUpdateCsvRow {
    pub id: String,
    pub timestamp: String,
    pub channel_id: String,
    pub title: String,
    pub started_at: String,
    pub viewer_count: u64,
}

impl ChatCsvRow {
    pub fn from_chat_event(
        id: uuid::Uuid,
        timestamp: DateTime<Utc>,
        channel_id: String,
        comment: String,
        chat_type: ChatType,
        user: User,
        is_admin: bool,
        has_ogq: bool,
    ) -> Self {
        Self {
            id: id.to_string(),
            timestamp: timestamp.to_rfc3339(),
            channel_id,
            user_id: user.id,
            username: user.label,
            comment,
            chat_type: format!("{:?}", chat_type),
            is_admin,
            has_ogq,
        }
    }
}

impl DonationCsvRow {
    pub fn from_donation_event(
        id: uuid::Uuid,
        timestamp: DateTime<Utc>,
        channel_id: String,
        from: String,
        from_label: String,
        amount: u32,
        donation_type: DonationType,
        message: Option<String>,
        become_top_fan: bool,
        fan_club_ordinal: u32,
    ) -> Self {
        Self {
            id: id.to_string(),
            timestamp: timestamp.to_rfc3339(),
            channel_id,
            from_user_id: from,
            from_user_name: from_label,
            amount,
            donation_type: format!("{:?}", donation_type),
            message: message.unwrap_or_default(),
            become_top_fan,
            fan_club_ordinal,
        }
    }
}

impl MuteCsvRow {
    pub fn from_mute_event(
        id: uuid::Uuid,
        timestamp: DateTime<Utc>,
        channel_id: String,
        user: User,
        seconds: u32,
        message: String,
        by: String,
        counts: u32,
        superuser_type: String,
    ) -> Self {
        Self {
            id: id.to_string(),
            timestamp: timestamp.to_rfc3339(),
            channel_id,
            target_user_id: user.id,
            target_username: user.label,
            seconds,
            message,
            moderator: by,
            counts,
            superuser_type,
        }
    }
}

impl KickCsvRow {
    pub fn from_kick_event(
        id: uuid::Uuid,
        timestamp: DateTime<Utc>,
        channel_id: String,
        user: User,
    ) -> Self {
        Self {
            id: id.to_string(),
            timestamp: timestamp.to_rfc3339(),
            channel_id,
            target_user_id: user.id,
            target_username: user.label,
        }
    }
}

impl MetadataUpdateCsvRow {
    pub fn from_metadata_event(
        id: uuid::Uuid,
        timestamp: DateTime<Utc>,
        channel_id: String,
        title: String,
        started_at: DateTime<Utc>,
        viewer_count: u64,
    ) -> Self {
        Self {
            id: id.to_string(),
            timestamp: timestamp.to_rfc3339(),
            channel_id,
            title,
            started_at: started_at.to_rfc3339(),
            viewer_count,
        }
    }
}
