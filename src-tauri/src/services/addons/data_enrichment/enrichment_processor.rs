use super::token_analyzer::TokenAnalyzer;
use crate::models::events::*;
use crate::services::ai::SentimentAnalyzer;
use crate::services::stats::models::*;

pub struct EnrichmentProcessor {
    token_analyzer: &'static TokenAnalyzer,
    sentiment_analyzer: Option<&'static SentimentAnalyzer>,
}

impl EnrichmentProcessor {
    pub fn new() -> Self {
        Self {
            token_analyzer: TokenAnalyzer::global(),
            sentiment_analyzer: SentimentAnalyzer::global(),
        }
    }

    pub async fn process_chat_event(&self, event: &ChatEvent) -> Option<EnrichedChatData> {
        // 만약 매니저 채팅이거나 BJ라면 생략
        if event.user.status.is_bj || event.user.status.is_manager {
            return None;
        }

        let tokens = self.token_analyzer.tokenize(&event.comment);
        let word_count = tokens.len();
        let character_count = event.comment.chars().count();

        // 감정 분석 수행 (실시간이므로 성능 문제 없음)
        let sentiment_analysis = self.sentiment_analyzer
            .and_then(|analyzer| analyzer.analyze(&event.comment).ok());

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
            sentiment_analysis,
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
