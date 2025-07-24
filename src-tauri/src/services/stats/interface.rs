use chrono::{DateTime, Utc};
use serde::Serialize;
use soup_sdk::chat::types::User;

use super::sentiment_stats::SentimentSummary;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatPerMinuteData {
    pub timestamp: DateTime<Utc>,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LOLData {
    pub timestamp: DateTime<Utc>,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActiveChatterRankingData {
    pub timestamp: DateTime<Utc>,
    pub rankings: Vec<ChatterRankingItem>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatterRankingItem {
    pub user: User,
    pub chat_count: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WordCountData {
    pub timestamp: DateTime<Utc>,
    pub words: Vec<WordCountItem>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WordCountItem {
    pub word: String,
    pub count: u32,
}

// 전처리 과정을 거친 이벤트입니다.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", content = "payload")]
pub enum StatsMatrix {
    ChatPerMinute(ChatPerMinuteData),
    LOL(LOLData),
    ActiveViewer(ActiveViewerData),
    ActiveChatterRanking(ActiveChatterRankingData),
    WordCount(WordCountData),
    Sentiment(SentimentSummary),
}

// 전처리 과정을 거친 이벤트입니다.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActiveViewerData {
    pub timestamp: DateTime<Utc>,
    /**
     * 합산한 결과입니다. 전체 활성 유저를 의미합니다.
     */
    pub total: u32,
    /**
     * 활성 유저 중, 구독자 수를 말합니다.(만약 구독과 팬이 경합하는 경우, 구독으로 포함됩니다.)
     */
    pub subscriber: u32,
    /**
     * 활성 유저 중, 팬 수(서포터 포함)를 말합니다.
     */
    pub fan: u32,
    /**
     * 어떠한 그룹에도 속하지 않는 경우입니다.
     */
    pub normal: u32,
}
