use chrono::Utc;
use std::collections::VecDeque;

use crate::services::stats::interface::StatsMatrix;
use crate::services::stats::matrix::chat_per_minute::calculate_chat_per_minute;

use super::models::*;
use super::stats_trait::Stats;

pub struct ChatPerMinuteStats;

impl ChatPerMinuteStats {
    pub fn new() -> Self {
        Self
    }
}

impl Stats for ChatPerMinuteStats {
    fn name(&self) -> &'static str {
        "chat_per_minute"
    }

    fn interval(&self) -> u64 {
        2500 // 2.5 계산 (밀리초)
    }

    fn evaluate(
        &self,
        chat_data: &VecDeque<EnrichedChatData>,
        _donation_data: &VecDeque<EnrichedDonationData>,
    ) -> StatsMatrix {
        // 최근 1분간의 채팅 수 계산
        let cpm = calculate_chat_per_minute(chat_data, Utc::now());
        StatsMatrix::ChatPerMinute(cpm)
    }
}
