use chrono::{DateTime, Duration, Utc};
use std::collections::VecDeque;

use crate::services::stats::{interface::LOLData, models::EnrichedChatData};

pub fn calculate_lol(chats: &VecDeque<EnrichedChatData>, standard: DateTime<Utc>) -> LOLData {
    let thirty_seconds_ago = standard - Duration::seconds(10);

    // 이진 탐색으로 시작점 찾기
    let start_index = chats
        .iter()
        .position(|chat| chat.timestamp >= thirty_seconds_ago)
        .unwrap_or(chats.len());

    // 시작점부터 끝까지만 검사하여 LOL 카운트
    let lol_count = chats.iter().skip(start_index).filter(|c| c.is_lol).count();

    LOLData {
        timestamp: standard,
        count: lol_count as u32,
    }
}
