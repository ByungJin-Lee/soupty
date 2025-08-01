use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use soup_sdk::chat::types::User;
use tokio::sync::oneshot;

use crate::models::reports::ReportData;

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

    // 채널 정보
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
        reply_to: oneshot::Sender<Result<Vec<TargetUser>, String>>,
    },
    AddTargetUser {
        user: TargetUser,
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

    // 방송 세션 관리
    DeleteBroadcastSession {
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<(), String>>,
    },

    // 방송 세션 검색
    SearchBroadcastSessions {
        filters: BroadcastSessionSearchFilters,
        pagination: PaginationParams,
        reply_to: oneshot::Sender<Result<BroadcastSessionSearchResult, String>>,
    },

    // 방송 세션 단일 조회
    GetBroadcastSession {
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<Option<BroadcastSessionResult>, String>>,
    },

    // 방송 세션 종료 시간 업데이트
    UpdateBroadcastSessionEndTime {
        broadcast_id: i64,
        ended_at: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<(), String>>,
    },

    // 방송 세션 vod 업데이트
    UpdateBroadcastSessionVOD {
        broadcast_id: i64,
        vod_id: u64,
        reply_to: oneshot::Sender<Result<(), String>>,
    },

    // 리포트 관리
    CreateReport {
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<(), String>>,
    },
    UpdateReportStatus {
        broadcast_id: i64,
        status: String,
        progress_percentage: Option<f64>,
        error_message: Option<String>,
        reply_to: oneshot::Sender<Result<(), String>>,
    },
    UpdateReportData {
        broadcast_id: i64,
        report_data: String, // JSON 형태
        reply_to: oneshot::Sender<Result<(), String>>,
    },
    GetReport {
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<Option<ReportInfo>, String>>,
    },
    DeleteReport {
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<(), String>>,
    },
    GetReportStatus {
        broadcast_id: i64,
        reply_to: oneshot::Sender<Result<Option<ReportStatusInfo>, String>>,
    },

    // 리포트 생성을 위한 로그 조회 (청크 단위)
    GetChatLogsForReport {
        broadcast_id: i64,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<Vec<ChatLogResult>, String>>,
    },
    GetEventLogsForReport {
        broadcast_id: i64,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
        reply_to: oneshot::Sender<Result<Vec<EventLogResult>, String>>,
    },

    // 사용자 기록 검색 (채팅 로그와 이벤트 로그 통합)
    SearchUserLogs {
        filters: UserSearchFilters,
        pagination: PaginationParams,
        reply_to: oneshot::Sender<Result<UserSearchResult, String>>,
    },

    // 전체 데이터 초기화
    ResetAllData {
        reply_to: oneshot::Sender<Result<(), String>>,
    },
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelData {
    pub channel_id: String,
    pub channel_name: String,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ChatMetadata {
    pub emoticon: Option<EmoticonMetadata>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmoticonMetadata {
    pub id: String,
    pub number: String,
    pub ext: String,
    pub version: String,
}

#[derive(Debug, Clone)]
pub struct ChatLogData {
    pub broadcast_id: i64,
    pub user_id: String,
    pub username: String,
    pub user_flag: u32,
    pub message_type: String,
    pub message: String,
    pub metadata: Option<ChatMetadata>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct EventLogData {
    pub broadcast_id: i64,
    pub user_id: Option<String>,
    pub username: Option<String>,
    pub user_flag: Option<u32>,
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
    pub username: Option<String>,
    pub message_contains: Option<String>,
    pub message_type: Option<String>,
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
    pub username: Option<String>,
    pub event_type: Option<String>,
    pub exclude_event_types: Vec<String>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub broadcast_id: Option<i64>,
}

// 방송 세션 검색 필터
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BroadcastSessionSearchFilters {
    pub channel_id: Option<String>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
}

// 사용자 검색 필터
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserSearchFilters {
    pub user_id: String,
    pub channel_id: Option<String>,
    pub session_id: Option<i64>,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
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

// 방송 세션 검색 결과
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BroadcastSessionSearchResult {
    pub broadcast_sessions: Vec<BroadcastSessionResult>,
    pub total_count: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_pages: i64,
}

// 사용자 검색 결과 (채팅과 이벤트 로그 통합)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserSearchResult {
    pub logs: Vec<UserLogEntry>,
    pub total_count: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_pages: i64,
}

// 방송 세션 결과
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BroadcastSessionResult {
    pub id: i64,
    pub channel_id: String,
    pub channel_name: String,
    pub vod_id: u64,
    pub title: String,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
}

// 채팅 로그 결과
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatLogResult {
    pub id: i64,
    pub broadcast_id: i64,
    pub user: User,
    pub message_type: String,
    pub message: String,
    pub metadata: Option<ChatMetadata>,
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
    pub user: Option<User>,
    pub event_type: String,
    pub payload: String,
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub channel_name: String,
    pub broadcast_title: String,
}

// 사용자 로그 엔트리 (채팅과 이벤트 통합)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserLogEntry {
    pub id: i64,
    pub broadcast_id: i64,
    pub user: User,
    pub log_type: String, // "CHAT" | "EVENT"
    pub timestamp: DateTime<Utc>,
    pub channel_id: String,
    pub channel_name: String,
    pub broadcast_title: String,
    // 채팅 로그 필드
    pub message_type: Option<String>,
    pub message: Option<String>,
    pub metadata: Option<ChatMetadata>,
    // 이벤트 로그 필드
    pub event_type: Option<String>,
    pub payload: Option<String>,
}

// 리포트 관련 구조체
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportInfo {
    pub broadcast_id: i64,
    pub status: String,
    pub report_data: Option<ReportData>,
    pub version: i32,
    pub error_message: Option<String>,
    pub progress_percentage: Option<f64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportStatusInfo {
    pub broadcast_id: i64,
    pub status: String,
    pub progress_percentage: Option<f64>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TargetUser {
    pub user_id: String,
    pub username: String,
}
