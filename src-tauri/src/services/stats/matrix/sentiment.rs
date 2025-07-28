use chrono::{DateTime, Duration, Utc};
use std::collections::VecDeque;

use crate::services::ai::sentiment_analyzer::Sentiment;
use crate::services::stats::models::EnrichedChatData;
use crate::services::stats::sentiment_stats::SentimentSummary;

/// 최근 15초간의 감정분석 통계를 계산합니다.
pub fn calculate_sentiment_summary(
    chat_data: &VecDeque<EnrichedChatData>,
    current_time: DateTime<Utc>,
) -> SentimentSummary {
    let fifteen_seconds_ago = current_time - Duration::seconds(15);

    // 최근 15초간의 감정분석 데이터만 필터링
    let recent_sentiments: Vec<_> = chat_data
        .iter()
        .filter(|chat| chat.timestamp >= fifteen_seconds_ago)
        .filter_map(|chat| chat.sentiment_analysis.as_ref())
        .collect();

    if recent_sentiments.is_empty() {
        return SentimentSummary {
            positive_count: 0,
            negative_count: 0,
            neutral_count: 0,
            total_count: 0,
            positive_ratio: 0.0,
            negative_ratio: 0.0,
            neutral_ratio: 0.0,
            average_score: 0.0,
        };
    }

    let positive_count = recent_sentiments
        .iter()
        .filter(|analysis| matches!(analysis.sentiment, Sentiment::Positive))
        .count() as u32;

    let negative_count = recent_sentiments
        .iter()
        .filter(|analysis| matches!(analysis.sentiment, Sentiment::Negative))
        .count() as u32;

    let neutral_count = recent_sentiments
        .iter()
        .filter(|analysis| matches!(analysis.sentiment, Sentiment::Neutral))
        .count() as u32;

    let total_count = recent_sentiments.len() as u32;

    let positive_ratio = if total_count > 0 {
        positive_count as f32 / total_count as f32
    } else {
        0.0
    };
    let negative_ratio = if total_count > 0 {
        negative_count as f32 / total_count as f32
    } else {
        0.0
    };
    let neutral_ratio = if total_count > 0 {
        neutral_count as f32 / total_count as f32
    } else {
        0.0
    };

    // 평균 감정 점수 계산
    let average_score = if total_count > 0 {
        recent_sentiments
            .iter()
            .map(|analysis| analysis.score)
            .sum::<f32>()
            / total_count as f32
    } else {
        0.0
    };

    SentimentSummary {
        positive_count,
        negative_count,
        neutral_count,
        total_count,
        positive_ratio,
        negative_ratio,
        neutral_ratio,
        average_score,
    }
}
