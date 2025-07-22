use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ReportStatus {
    #[serde(rename = "PENDING")]
    Pending,
    #[serde(rename = "GENERATING")]
    Generating,
    #[serde(rename = "COMPLETED")]
    Completed,
    #[serde(rename = "FAILED")]
    Failed,
}

impl From<String> for ReportStatus {
    fn from(s: String) -> Self {
        match s.as_str() {
            "PENDING" => ReportStatus::Pending,
            "GENERATING" => ReportStatus::Generating,
            "COMPLETED" => ReportStatus::Completed,
            "FAILED" => ReportStatus::Failed,
            _ => ReportStatus::Pending,
        }
    }
}

impl From<ReportStatus> for String {
    fn from(status: ReportStatus) -> Self {
        match status {
            ReportStatus::Pending => "PENDING".to_string(),
            ReportStatus::Generating => "GENERATING".to_string(),
            ReportStatus::Completed => "COMPLETED".to_string(),
            ReportStatus::Failed => "FAILED".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Report {
    pub id: i64,
    pub broadcast_id: i64,
    pub status: ReportStatus,
    pub report_data: Option<ReportData>,
    pub version: i32,
    pub error_message: Option<String>,
    pub progress_percentage: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportData {
    pub metadata: ReportMetadata,
    pub user_analysis: UserAnalysis,
    pub chat_analysis: ChatAnalysis,
    pub chunks: Vec<ReportChunk>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportChunk {
    pub user: UserVital,
    pub chat: ChatVital,
    pub viewer_count: Option<u64>,
    // pub event: EventVital,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportMetadata {
    pub duration_seconds: u64,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    /**
     * 한 청크당 몇 초인지를 의미합니다.
     */
    pub chunk_size: u32,
}

// #[derive(Debug, Clone, Serialize, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct EventAnalysis {
//     /**
//      * metadata updated 이벤트는 집계하지 않음
//      */
//     pub total_count: u64,
//     pub donation_total: u64,
//     pub donation_count: u64,
//     pub subscription_count: u64,
// }

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatAnalysis {
    // pub summary: AnalysisSummary,
    pub total_count: u64,
    // pub top_chatters: Vec<UserStats>,
    // pub popular_words: Vec<WordCount>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserAnalysis {
    pub unique_count: u32,
    pub subscriber_count: u32,
    pub fan_count: u32,
    pub normal_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatVital {
    pub total_count: usize,
    pub top_chatters: Vec<UserStats>,
    // pub chat_sentiment: SentimentAnalysis,
    pub popular_words: Vec<WordCount>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserVital {
    pub unique_count: u32,
    pub subscriber_count: u32,
    pub fan_count: u32,
    pub normal_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalysisSummary {
    pub avg: f32,
    pub max: f32,
    pub min: f32,
    pub total: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStats {
    pub user_id: String,
    pub username: String,
    pub message_count: u64,
    pub donation_amount: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SentimentAnalysis {
    pub positive_ratio: f64,
    pub negative_ratio: f64,
    pub neutral_ratio: f64,
    pub overall_sentiment: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordCount {
    pub word: String,
    pub count: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModerationStats {
    pub kicks: u64,
    pub mutes: u64,
    pub bans: u64,
    pub freezes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportGenerationProgress {
    pub broadcast_id: i64,
    pub status: ReportStatus,
    pub progress_percentage: f64,
    pub current_step: String,
    pub error_message: Option<String>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChunkProcessingInfo {
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub chunk_index: usize,
    pub total_chunks: usize,
}
