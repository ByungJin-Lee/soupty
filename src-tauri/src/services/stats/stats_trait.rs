use std::collections::VecDeque;

use crate::services::stats::interface::StatsMatrix;

use super::models::*;

pub trait Stats: Send + Sync {
    /// 통계의 고유 이름
    fn name(&self) -> &'static str;

    /// 계산 주기 (밀리초)
    fn interval(&self) -> u64;

    /// 통계 평가/계산 실행
    fn evaluate(
        &self,
        chat_data: &VecDeque<EnrichedChatData>,
        donation_data: &VecDeque<EnrichedDonationData>,
    ) -> StatsMatrix;
}
