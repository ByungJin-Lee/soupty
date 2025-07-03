use std::collections::HashSet;

use tokio::sync::RwLockReadGuard;

use crate::services::stats::models::{EnrichedChatData, EnrichedDonationData};


pub fn calculate_active_viewer(
  chats: RwLockReadGuard<'_, Vec<EnrichedChatData>>,
  donations: RwLockReadGuard<'_, Vec<EnrichedDonationData>>,
) -> usize {
    let chat_user_ids = chats.iter().map(|chat| chat.user_id.to_string());
    let donation_user_ids = donations.iter().map(|donation| donation.user_id.to_string());

    let active_viewer_count: HashSet<_> = chat_user_ids.chain(donation_user_ids).collect();
    active_viewer_count.len()
}