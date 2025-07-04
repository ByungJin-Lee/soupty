use std::collections::VecDeque;

use crate::services::stats::interface::StatsMatrix;
use crate::services::stats::matrix::active_viewer::calculate_active_viewer;

use super::models::*;
use super::stats_trait::Stats;

pub struct ActiveViewerStats;

impl ActiveViewerStats {
    pub fn new() -> Self {
        Self
    }
}

impl Stats for ActiveViewerStats {
    fn interval_cycles(&self) -> u64 {
        1 // 1 cycle = 2500ms
    }

    fn evaluate(
        &self,
        chat_data: &VecDeque<EnrichedChatData>,
        donation_data: &VecDeque<EnrichedDonationData>,
    ) -> StatsMatrix {
        let active_viewer_data = calculate_active_viewer(chat_data, donation_data);
        StatsMatrix::ActiveViewer(active_viewer_data)
    }
}
