use async_trait::async_trait;
use chrono::{Duration, Utc};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::services::stats::matrix::lol::calculate_lol;

use super::models::*;
use super::stats_trait::Stats;

pub struct LOLStats;

impl LOLStats {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Stats for LOLStats {
    fn name(&self) -> &'static str {
        "lol"
    }

    fn interval(&self) -> u64 {
        2500 // 2.5 계산 (밀리초)
    }

    async fn evaluate(
        &self,
        chat_data: &Arc<RwLock<Vec<EnrichedChatData>>>,
        _donation_data: &Arc<RwLock<Vec<EnrichedDonationData>>>,
    ) -> f32 {
        let chat_data_guard = chat_data.read().await;
        // 최근 30초간
        let lol = calculate_lol(chat_data_guard, Utc::now());
        lol as f32
    }
}
