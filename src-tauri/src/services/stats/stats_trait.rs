use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::RwLock;

use super::models::*;

#[async_trait]
pub trait Stats: Send + Sync {
    /// 통계의 고유 이름
    fn name(&self) -> &'static str;

    /// 계산 주기 (밀리초)
    fn interval(&self) -> u64;

    /// 통계 평가/계산 실행
    async fn evaluate(
        &self,
        chat_data: &Arc<RwLock<Vec<EnrichedChatData>>>,
        donation_data: &Arc<RwLock<Vec<EnrichedDonationData>>>,
    ) -> f32;
}
