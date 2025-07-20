use std::collections::VecDeque;

use crate::services::stats::{
    interface::StatsMatrix,
    matrix::active_chatter_ranking::calculate_active_chatter_ranking,
    models::{EnrichedChatData, EnrichedDonationData},
    stats_trait::Stats,
};

pub struct ActiveChatterRankingStats;

impl ActiveChatterRankingStats {
    pub fn new() -> Self {
        Self {}
    }
}

impl Stats for ActiveChatterRankingStats {
    fn interval_cycles(&self) -> u64 {
        2
    }

    fn evaluate(
        &self,
        chat_data: &VecDeque<EnrichedChatData>,
        _donation_data: &VecDeque<EnrichedDonationData>,
    ) -> StatsMatrix {
        let result = calculate_active_chatter_ranking(chat_data);
        StatsMatrix::ActiveChatterRanking(result)
    }
}
