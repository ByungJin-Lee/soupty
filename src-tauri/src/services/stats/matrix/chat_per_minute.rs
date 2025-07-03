use chrono::{DateTime, Duration, Utc};
use tokio::sync::RwLockReadGuard;

use crate::services::stats::models::EnrichedChatData;


pub fn calculate_chat_per_minute(
  chats: RwLockReadGuard<'_, Vec<EnrichedChatData>>,
  standard: DateTime<Utc>,
) -> usize {

  let one_minute_ago = standard - Duration::minutes(1);

  let cpm = chats
    .iter()
    .filter(|c| c.timestamp >= one_minute_ago)
    .count();

  cpm
}