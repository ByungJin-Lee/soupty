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
    fn interval_cycles(&self) -> u64 {
        1 // 1 cycle = 2500ms
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
