use serde::{Deserialize, Serialize};
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

    GetChannels {
        reply_to: oneshot::Sender<Result<Vec<ChannelData>, String>>, 
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
    
    DeleteChannel {
        channel_id: String,
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

    // Target Users 관리
    GetTargetUsers {
        reply_to: oneshot::Sender<Result<Vec<String>, String>>,
    },
    AddTargetUser {
        user_id: String,
        description: Option<String>,
        reply_to: oneshot::Sender<Result<(), String>>,
    },
    RemoveTargetUser {
        user_id: String,
        reply_to: oneshot::Sender<Result<(), String>>,
    },

    // 채팅 기록 검색
    SearchChatLogs {
        filters: ChatSearchFilters,
        pagination: PaginationParams,
        reply_to: oneshot::Sender<Result<ChatSearchResult, String>>,
    },
    
    // 이벤트 기록 검색
    SearchEventLogs {
        filters: EventSearchFilters,
        pagination: PaginationParams,
        reply_to: oneshot::Sender<Result<EventSearchResult, String>>,
    },
}

#[derive(Debug, Clone)]
pub struct UserData {
    pub user_id: String,
    pub username: String,
    pub last_seen: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
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

// 채팅 검색 필터
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatSearchFilters {
    pub channel_id: Option<String>,
    pub user_id: Option<String>,
    pub message_contains: Option<String>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub broadcast_id: Option<i64>,
}

// 이벤트 검색 필터
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EventSearchFilters {
    pub channel_id: Option<String>,
    pub user_id: Option<String>,
    pub event_type: Option<String>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub broadcast_id: Option<i64>,
}

// 페이지네이션 파라미터
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginationParams {
    pub page: i64,
    pub page_size: i64,
}

// 채팅 검색 결과
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatSearchResult {
    pub chat_logs: Vec<ChatLogResult>,
    pub total_count: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_pages: i64,
}

// 이벤트 검색 결과
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EventSearchResult {
    pub event_logs: Vec<EventLogResult>,
    pub total_count: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_pages: i64,
}

// 채팅 로그 결과
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatLogResult {
    pub id: i64,
    pub broadcast_id: i64,
    pub user_id: String,
    pub username: String,
    pub message_type: String,
    pub message: String,
    pub metadata: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub channel_name: String,
    pub broadcast_title: String,
}

// 이벤트 로그 결과
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EventLogResult {
    pub id: i64,
    pub broadcast_id: i64,
    pub user_id: Option<String>,
    pub username: Option<String>,
    pub event_type: String,
    pub payload: String,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub channel_name: String,
    pub broadcast_title: String,
}
