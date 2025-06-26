use chrono::{DateTime, Utc};
use serde::Serialize;
use soup_sdk::chat::types::{ChatType, Emoticon, User};

// 전처리 과정을 거친 이벤트입니다.
pub enum DomainEvent {
    Chat(ChatEvent),
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatEvent {
    pub timestamp: DateTime<Utc>,
    pub comment: String,
    pub chat_type: ChatType,
    pub user: User,
    pub is_admin: bool,
    pub ogq: Option<Emoticon>,
}
