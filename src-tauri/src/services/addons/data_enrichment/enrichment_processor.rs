
use crate::models::events::*;
use crate::services::stats::models::*;
use super::token_analyzer::TokenAnalyzer;

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
            user_id: event.user.id.clone(),
            user_name: event.user.label.clone(),
            message: event.comment.clone(),
            timestamp: event.timestamp,
            tokens,
            word_count,
            character_count,
            is_question: self.is_question(&event.comment),
            contains_url: self.contains_url(&event.comment),
            contains_emoji: self.contains_emoji(&event.comment),
            language: self.detect_language(&event.comment),
        })
    }

    pub async fn process_donation_event(&self, event: &DonationEvent) -> Option<EnrichedDonationData> {
        let message_tokens = event.message.as_ref()
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
            amount_tier: self.calculate_amount_tier(event.amount as f64),
            is_milestone: self.is_milestone_amount(event.amount as f64),
        })
    }



    fn is_question(&self, message: &str) -> bool {
        message.contains('?') || 
        message.to_lowercase().starts_with("what") ||
        message.to_lowercase().starts_with("how") ||
        message.to_lowercase().starts_with("why") ||
        message.to_lowercase().starts_with("when") ||
        message.to_lowercase().starts_with("where")
    }

    fn contains_url(&self, message: &str) -> bool {
        message.contains("http://") || 
        message.contains("https://") || 
        message.contains("www.")
    }

    fn contains_emoji(&self, message: &str) -> bool {
        message.chars().any(|c| {
            matches!(c as u32,
                0x1F600..=0x1F64F | // Emoticons
                0x1F300..=0x1F5FF | // Misc Symbols and Pictographs
                0x1F680..=0x1F6FF | // Transport and Map
                0x1F1E0..=0x1F1FF | // Regional indicator
                0x2600..=0x26FF |   // Miscellaneous Symbols
                0x2700..=0x27BF     // Dingbats
            )
        })
    }

    fn detect_language(&self, message: &str) -> String {
        // Simple language detection - can be enhanced with proper language detection library
        let korean_chars = message.chars().filter(|c| {
            matches!(*c as u32, 0xAC00..=0xD7AF | 0x1100..=0x11FF | 0x3130..=0x318F)
        }).count();
        
        let total_chars = message.chars().count();
        
        if korean_chars > 0 && (korean_chars as f32 / total_chars as f32) > 0.3 {
            "ko".to_string()
        } else {
            "en".to_string()
        }
    }

    fn calculate_amount_tier(&self, amount: f64) -> String {
        match amount {
            a if a < 1000.0 => "small",
            a if a < 5000.0 => "medium", 
            a if a < 10000.0 => "large",
            _ => "huge"
        }.to_string()
    }

    fn is_milestone_amount(&self, amount: f64) -> bool {
        amount >= 1000.0 && (amount as i64 % 1000 == 0)
    }


}


