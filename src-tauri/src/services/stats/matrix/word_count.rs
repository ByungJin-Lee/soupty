use chrono::{Duration, Utc};
use std::collections::{HashMap, VecDeque};

use crate::services::stats::interface::{WordCountData, WordCountItem};
use crate::services::stats::models::*;

pub fn calculate_word_count(
    chat_data: &VecDeque<EnrichedChatData>,
    time_window_seconds: i64,
) -> WordCountData {
    let current_time = Utc::now();
    let cutoff_time = current_time - Duration::seconds(time_window_seconds);

    let mut word_counts: HashMap<String, u32> = HashMap::new();

    // 최근 time_window_minutes 분 데이터에서 토큰 수집
    for chat in chat_data {
        if chat.timestamp >= cutoff_time {
            for token in &chat.tokens {
                if !token.trim().is_empty() {
                    *word_counts.entry(token.clone()).or_insert(0) += 1;
                }
            }
        }
    }

    // 상위 100개 단어로 제한 (워드클라우드용)
    let mut word_list: Vec<WordCountItem> = word_counts
        .into_iter()
        .map(|(word, count)| WordCountItem { word, count })
        .collect();

    // 빈도 순으로 정렬
    word_list.sort_by(|a, b| b.count.cmp(&a.count));
    word_list.truncate(100);

    WordCountData {
        timestamp: current_time,
        words: word_list,
    }
}
