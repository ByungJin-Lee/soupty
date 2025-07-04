use std::collections::VecDeque;

use crate::services::stats::interface::StatsMatrix;
use crate::services::stats::matrix::word_count::calculate_word_count;
use crate::services::stats::models::*;
use crate::services::stats::stats_trait::Stats;

pub struct WordCountStats;

impl WordCountStats {
    pub fn new() -> Self {
        Self {}
    }
}

impl Stats for WordCountStats {
    fn interval_cycles(&self) -> u64 {
        2
    }

    fn evaluate(
        &self,
        chat_data: &VecDeque<EnrichedChatData>,
        _donation_data: &VecDeque<EnrichedDonationData>,
    ) -> StatsMatrix {
        let word_count_data = calculate_word_count(chat_data, 30);
        StatsMatrix::WordCount(word_count_data)
    }
}
