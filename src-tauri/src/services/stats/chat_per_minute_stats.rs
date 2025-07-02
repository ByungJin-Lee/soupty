use async_trait::async_trait;
use chrono::{Duration, Utc};
use std::sync::Arc;
use tokio::sync::RwLock;

use super::models::*;
use super::stats_trait::Stats;

pub struct ChatPerMinuteStats;

impl ChatPerMinuteStats {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Stats for ChatPerMinuteStats {
    fn name(&self) -> &'static str {
        "chat_per_minute"
    }

    fn interval(&self) -> u64 {
        60000 // 1분마다 계산 (밀리초)
    }

    async fn evaluate(
        &self,
        chat_data: &Arc<RwLock<Vec<EnrichedChatData>>>,
        _donation_data: &Arc<RwLock<Vec<EnrichedDonationData>>>,
    ) -> f32 {
        let chat_data_guard = chat_data.read().await;
        let now = Utc::now();
        let one_minute_ago = now - Duration::minutes(1);

        // 최근 1분간의 채팅 수 계산
        let recent_chat_count = chat_data_guard
            .iter()
            .filter(|chat| chat.timestamp >= one_minute_ago)
            .count();

        recent_chat_count as f32
    }
}
