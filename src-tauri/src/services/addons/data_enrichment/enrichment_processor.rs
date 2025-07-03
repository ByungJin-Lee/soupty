use super::token_analyzer::TokenAnalyzer;
use crate::models::events::*;
use crate::services::stats::models::*;

pub struct EnrichmentProcessor {
    token_analyzer: TokenAnalyzer,
}

impl EnrichmentProcessor {
    pub fn new() -> Self {
        Self {
            token_analyzer: TokenAnalyzer::new(),
        }
    }

    pub async fn process_chat_event(&self, event: &ChatEvent) -> Option<EnrichedChatData> {
        let tokens = self.token_analyzer.tokenize(&event.comment);
        let word_count = tokens.len();
        let character_count = event.comment.chars().count();

        Some(EnrichedChatData {
            event_id: event.id,
            channel_id: event.channel_id.clone(),
            user: event.user.clone(),
            message: event.comment.clone(),
            timestamp: event.timestamp,
            tokens,
            word_count,
            character_count,
            is_lol: self.is_lol(&event.comment),
        })
    }

    pub async fn process_donation_event(
        &self,
        event: &DonationEvent,
    ) -> Option<EnrichedDonationData> {
        let message_tokens = event
            .message
            .as_ref()
            .map(|msg| self.token_analyzer.tokenize(msg))
            .unwrap_or_default();

        Some(EnrichedDonationData {
            event_id: event.id,
            channel_id: event.channel_id.clone(),
            user_id: event.from.clone(),
            user_name: event.from_label.clone(),
            amount: event.amount,
            message: event.message.clone(),
            timestamp: event.timestamp,
            message_tokens,
        })
    }

    fn is_lol(&self, message: &str) -> bool {
        message.contains("ㅋ")
    }
}
