use tokio::sync::oneshot;
use chrono::{DateTime, Utc};

#[derive(Debug)]
pub enum DBCommand {
    Initialize, // 마이그레이션 등 초기화 작업을 위한 커맨드
    
    // 방송 세션 관리
    CreateBroadcastSession {
        channel_id: String,
        title: String,
        started_at: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<i64, String>>, // broadcast_id 반환
    },
    EndBroadcastSession {
        broadcast_id: i64,
        ended_at: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<(), String>>,
    },
    
    // 사용자 및 채널 정보
    UpsertUsers {
        users: Vec<UserData>,
        reply_to: oneshot::Sender<Result<(), String>>,
    },
    UpsertChannels {
        channels: Vec<ChannelData>,
        reply_to: oneshot::Sender<Result<(), String>>,
    },
    
    // 로그 배치 저장
    InsertChatLogs {
        logs: Vec<ChatLogData>,
        reply_to: oneshot::Sender<Result<(), String>>,
    },
    InsertEventLogs {
        logs: Vec<EventLogData>,
        reply_to: oneshot::Sender<Result<(), String>>,
    },
}

#[derive(Debug, Clone)]
pub struct UserData {
    pub user_id: String,
    pub username: String,
    pub last_seen: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct ChannelData {
    pub channel_id: String,
    pub channel_name: String,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct ChatLogData {
    pub broadcast_id: i64,
    pub user_id: String,
    pub message_type: String,
    pub message: String,
    pub metadata: Option<String>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct EventLogData {
    pub broadcast_id: i64,
    pub user_id: Option<String>,
    pub event_type: String,
    pub payload: String,
    pub timestamp: DateTime<Utc>,
}
