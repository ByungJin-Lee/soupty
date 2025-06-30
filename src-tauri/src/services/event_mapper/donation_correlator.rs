use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;
use soup_sdk::chat::types::DonationType;

use crate::models::events::DonationEvent;
use super::constants::DONATION_CHAT_CORRELATION_WINDOW_MS;

#[derive(Debug)]
pub struct PendingDonation {
    pub event: DonationEvent,
    pub donation_timestamp: DateTime<Utc>,
    pub first_chat: Option<String>,
}

/// 후원 이벤트와 채팅 메시지 간의 상관관계 확인하는 모듈
pub struct DonationCorrelator {
    pending_donations: HashMap<String, PendingDonation>,
}

impl DonationCorrelator {
    pub fn new() -> Self {
        Self {
            pending_donations: HashMap::new(),
        }
    }

    /// 새로운 후원 이벤트를 대기 큐에 추가
    pub fn add_pending_donation(
        &mut self,
        user_id: String,
        channel_id: String,
        from: String,
        from_label: String,
        amount: u32,
        fan_club_ordinal: u32,
        become_top_fan: bool,
        donation_type: DonationType,
        timestamp: DateTime<Utc>,
    ) {
        let donation_event = DonationEvent {
            id: Uuid::new_v4(),
            timestamp,
            channel_id,
            from: from.clone(),
            from_label: from_label.clone(),
            amount,
            fan_club_ordinal,
            become_top_fan,
            donation_type,
            message: None,
        };

        self.pending_donations.insert(
            user_id,
            PendingDonation {
                event: donation_event,
                donation_timestamp: timestamp,
                first_chat: None,
            },
        );
    }

    /// 채팅 메시지가 대기 중인 후원과 연결될 수 있는지 확인하고 연결
    pub fn try_link_chat_to_donation(
        &mut self,
        user_id: &str,
        user_label: &str,
        chat_message: &str,
        chat_timestamp: DateTime<Utc>,
    ) -> bool {
        if let Some(pending) = self.pending_donations.get_mut(user_id) {
            let time_diff = (chat_timestamp - pending.donation_timestamp).num_milliseconds();

            if time_diff <= DONATION_CHAT_CORRELATION_WINDOW_MS
                && time_diff >= 0
                && pending.first_chat.is_none()
            {
                log::info!(
                    "💬 First chat from {} linked to donation (+{}ms): {}",
                    user_label,
                    time_diff,
                    chat_message
                );
                pending.first_chat = Some(chat_message.to_string());
                return true;
            }
        }
        false
    }

    /// 제한 시간이 경과한 후원 이벤트들을 처리하고 반환
    pub fn flush_expired_donations(&mut self) -> Vec<DonationEvent> {
        let mut completed = Vec::new();
        let now = Utc::now();

        self.pending_donations.retain(|_, pending| {
            let elapsed_ms = (now - pending.donation_timestamp).num_milliseconds();

            if elapsed_ms > DONATION_CHAT_CORRELATION_WINDOW_MS {
                let mut enhanced_donation = pending.event.clone();
                enhanced_donation.message = pending.first_chat.clone();
                completed.push(enhanced_donation);
                false // 큐에서 제거
            } else {
                true // 큐에 유지
            }
        });

        completed
    }

    /// 현재 대기 중인 후원 이벤트 수
    #[allow(dead_code)]
    pub fn pending_count(&self) -> usize {
        self.pending_donations.len()
    }
}