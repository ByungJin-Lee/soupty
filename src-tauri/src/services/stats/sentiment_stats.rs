use chrono::Utc;
use std::collections::VecDeque;

use crate::services::stats::interface::StatsMatrix;
use crate::services::stats::matrix::sentiment::calculate_sentiment_summary;

use super::models::*;
use super::stats_trait::Stats;

pub struct SentimentStats;

impl SentimentStats {
    pub fn new() -> Self {
        Self
    }
}

impl Stats for SentimentStats {
    fn interval_cycles(&self) -> u64 {
        1 // 1 cycle = 2500ms, 자주 업데이트하여 실시간 감정 변화 추적
    }

    fn evaluate(
        &self,
        chat_data: &VecDeque<EnrichedChatData>,
        _donation_data: &VecDeque<EnrichedDonationData>,
    ) -> StatsMatrix {
        let sentiment_summary = calculate_sentiment_summary(chat_data, Utc::now());
        StatsMatrix::Sentiment(sentiment_summary)
    }
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SentimentSummary {
    pub positive_count: u32,
    pub negative_count: u32,
    pub neutral_count: u32,
    pub total_count: u32,
    pub positive_ratio: f32,
    pub negative_ratio: f32,
    pub neutral_ratio: f32,
    pub average_score: f32,
}
