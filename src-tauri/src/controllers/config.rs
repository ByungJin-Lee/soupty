use std::time::Duration;

// Timer intervals
pub const METADATA_UPDATE_INTERVAL_SECS: u64 = 30;
pub const TIMER_TICK_INTERVAL_MS: u64 = crate::services::event_mapper::DONATION_FLUSH_INTERVAL_MS;

// Derived configurations
pub fn metadata_update_duration() -> Duration {
    Duration::from_secs(METADATA_UPDATE_INTERVAL_SECS)
}

pub fn timer_tick_duration() -> Duration {
    Duration::from_millis(TIMER_TICK_INTERVAL_MS)
}
