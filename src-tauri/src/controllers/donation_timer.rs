use std::sync::Arc;

use tokio::sync::Mutex;

use crate::{
    controllers::addon_manager::AddonManager,
    services::{addons::interface::AddonContext, event_mapper::EventMapper},
};

pub struct DonationTimer;

impl DonationTimer {
    pub async fn process_donations(
        event_mapper: &Arc<Mutex<EventMapper>>,
        manager: &AddonManager,
        ctx: &AddonContext,
    ) {
        let expired_donations = {
            let mut mapper = event_mapper.lock().await;
            mapper.flush_expired_donations()
        };

        for donation_event in expired_donations {
            manager.dispatch(ctx, &donation_event).await;
        }
    }
}
