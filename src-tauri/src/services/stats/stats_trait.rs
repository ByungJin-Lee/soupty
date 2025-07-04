use std::collections::VecDeque;

use crate::services::stats::interface::StatsMatrix;

use super::models::*;

pub trait Stats: Send + Sync {
    /// 계산 주기 (사이클 단위, 1 사이클 = 2500ms)
    fn interval_cycles(&self) -> u64;

    /// 통계 평가/계산 실행
    fn evaluate(
        &self,
        chat_data: &VecDeque<EnrichedChatData>,
        donation_data: &VecDeque<EnrichedDonationData>,
    ) -> StatsMatrix;
}
