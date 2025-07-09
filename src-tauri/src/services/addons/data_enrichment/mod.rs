use async_trait::async_trait;
use std::sync::Arc;

use crate::models::events::*;
use crate::services::addons::interface::{Addon, AddonContext};
use crate::services::stats::core_stats_service::CoreStatsService;
use tauri::AppHandle;

pub mod enrichment_processor;
pub mod token_analyzer;

use enrichment_processor::EnrichmentProcessor;

pub struct DataEnrichmentAddon {
    core_stats_service: Arc<CoreStatsService>,
    enrichment_processor: EnrichmentProcessor,
}

impl DataEnrichmentAddon {
    pub fn new(app_handle: AppHandle) -> Self {
        let core_service = Arc::new(CoreStatsService::new(2, app_handle));

        core_service.clone().start_stats_scheduler();

        Self {
            core_stats_service: core_service, // 2분 윈도우
            enrichment_processor: EnrichmentProcessor::new(),
        }
    }
}

#[async_trait]
impl Addon for DataEnrichmentAddon {
    fn name(&self) -> &'static str {
        "data-enrichment"
    }

    async fn on_chat(&self, _ctx: &AddonContext, event: &ChatEvent) {
        if let Some(enriched_data) = self.enrichment_processor.process_chat_event(event).await {
            self.core_stats_service
                .record_chat_data(enriched_data)
                .await;
        }
    }

    async fn on_donation(&self, _ctx: &AddonContext, event: &DonationEvent) {
        if let Some(enriched_data) = self
            .enrichment_processor
            .process_donation_event(event)
            .await
        {
            self.core_stats_service
                .record_donation_data(enriched_data)
                .await;
        }
    }

    async fn stop(&self, _ctx: &AddonContext) {
        println!("[DataEnrichmentAddon] Stopping addon - cleaning up resources");
        self.core_stats_service.stop().await;
        println!("[DataEnrichmentAddon] Cleanup completed");
    }
}
