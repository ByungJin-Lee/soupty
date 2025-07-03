use async_trait::async_trait;
use chrono::{Duration, Utc};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::services::stats::matrix::active_viewer::calculate_active_viewer;
use crate::services::stats::matrix::chat_per_minute::calculate_chat_per_minute;

use super::models::*;
use super::stats_trait::Stats;

pub struct ActiveViewerStats;

impl ActiveViewerStats {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Stats for ActiveViewerStats {
    fn name(&self) -> &'static str {
        "active_viewer"
    }

    fn interval(&self) -> u64 {
        2500 // 2.5 계산 (밀리초)
    }

    async fn evaluate(
        &self,
        chat_data: &Arc<RwLock<Vec<EnrichedChatData>>>,
        donation_data: &Arc<RwLock<Vec<EnrichedDonationData>>>,
    ) -> f32 {
        let chat_data_guard = chat_data.read().await;
        let donation_data_guard = donation_data.read().await;

        // 최근 1분간의 채팅 수 계산
        let active_viewer_count = calculate_active_viewer(chat_data_guard, donation_data_guard);
        active_viewer_count as f32
    }
}
