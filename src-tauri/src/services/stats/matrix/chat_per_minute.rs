use chrono::{DateTime, Duration, Utc};
use std::collections::VecDeque;

use crate::services::stats::{interface::ChatPerMinuteData, models::EnrichedChatData};

pub fn calculate_chat_per_minute(
    chats: &VecDeque<EnrichedChatData>,
    standard: DateTime<Utc>,
) -> ChatPerMinuteData {
    let one_minute_ago = standard - Duration::minutes(1);

    // 이진 탐색으로 시작점 찾기 (VecDeque는 시간순으로 정렬되어 있음)
    let start_index = chats
        .iter()
        .position(|chat| chat.timestamp >= one_minute_ago)
        .unwrap_or(chats.len());
    
    let count = chats.len() - start_index;

    ChatPerMinuteData {
        timestamp: standard,
        count: count as u32,
    }
}
