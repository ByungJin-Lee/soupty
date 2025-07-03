use chrono::Utc;
use std::collections::VecDeque;

use crate::services::stats::interface::StatsMatrix;
use crate::services::stats::matrix::lol::calculate_lol;

use super::models::*;
use super::stats_trait::Stats;

pub struct LOLStats;

impl LOLStats {
    pub fn new() -> Self {
        Self
    }
}

impl Stats for LOLStats {
    fn name(&self) -> &'static str {
        "lol"
    }

    fn interval(&self) -> u64 {
        2500 // 2.5 계산 (밀리초)
    }

    fn evaluate(
        &self,
        chat_data: &VecDeque<EnrichedChatData>,
        _donation_data: &VecDeque<EnrichedDonationData>,
    ) -> StatsMatrix {
        // 최근 30초간
        let lol = calculate_lol(chat_data, Utc::now());
        StatsMatrix::LOL(lol)
    }
}
