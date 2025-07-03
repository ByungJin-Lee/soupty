use chrono::{DateTime, Duration, Utc};
use tokio::sync::RwLockReadGuard;

use crate::services::stats::models::EnrichedChatData;


pub fn calculate_lol(
  chats: RwLockReadGuard<'_, Vec<EnrichedChatData>>,
  standard: DateTime<Utc>,
) -> usize {

  let thirty_seconds_ago = standard - Duration::seconds(10);

  let lol = chats
    .iter()
    .filter(|c| c.is_lol && c.timestamp >= thirty_seconds_ago)
    .count();

  lol
}