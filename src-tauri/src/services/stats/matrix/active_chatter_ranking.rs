use std::collections::{HashMap, VecDeque};

use chrono::{Duration, Utc};
use soup_sdk::chat::types::User;

use crate::services::stats::{
    interface::{ActiveChatterRankingData, ChatterRankingItem},
    models::EnrichedChatData,
};

pub fn calculate_active_chatter_ranking(
    chats: &VecDeque<EnrichedChatData>,
) -> ActiveChatterRankingData {
    let standard = Utc::now();
    let cutoff_time = standard - Duration::minutes(2);

    let mut chat_counts: HashMap<String, (User, u32)> = HashMap::new();

    for chat in chats.iter() {
        if chat.timestamp >= cutoff_time {
            let user_id = &chat.user.id;

            chat_counts
                .entry(user_id.clone())
                .and_modify(|(_, count)| *count += 1)
                .or_insert((chat.user.clone(), 1));
        }
    }

    let mut rankings: Vec<ChatterRankingItem> = chat_counts
        .into_iter()
        .map(|(_, (user, chat_count))| ChatterRankingItem { user, chat_count })
        .collect();

    rankings.sort_by(|a, b| b.chat_count.cmp(&a.chat_count));
    rankings.truncate(10);

    ActiveChatterRankingData {
        timestamp: standard,
        rankings,
    }
}
