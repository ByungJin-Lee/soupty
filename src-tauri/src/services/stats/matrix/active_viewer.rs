use std::collections::{HashSet, VecDeque};

use chrono::Utc;
use soup_sdk::chat::types::UserStatus;

use crate::services::stats::{
    interface::ActiveViewerData,
    models::{EnrichedChatData, EnrichedDonationData},
};

pub fn calculate_active_viewer(
    chats: &VecDeque<EnrichedChatData>,
    donations: &VecDeque<EnrichedDonationData>,
) -> ActiveViewerData {
    let standard = Utc::now();
    
    let mut user_set = HashSet::with_capacity(chats.len() + donations.len());
    let mut counts = [0u32; 3]; // [subscriber, fan, normal]
    
    // 채팅 사용자 처리
    for chat in chats.iter() {
        let user_id = &chat.user.id;
        if user_set.insert(user_id) { // 중복 체크와 삽입을 동시에
            let group = classify_user_group(&chat.user.status);
            if group < 3 {
                counts[group as usize] += 1;
            }
        }
    }
    
    // 도네이션 사용자 처리 (새로운 사용자만 일반사용자로 분류)
    for donation in donations.iter() {
        let user_id = &donation.user_id;
        if user_set.insert(user_id) { // 새로운 사용자만 카운트
            counts[2] += 1; // 일반 사용자로 분류
        }
    }
    
    ActiveViewerData {
        total: counts.iter().sum(),
        subscriber: counts[0],
        fan: counts[1],
        normal: counts[2],
        timestamp: standard,
    }
}

/**
 * 사용자를 그룹 별로 분류합니다.
 * 0: 구독자
 * 1: 팬(+서포터)
 * 2: 일반 사용자
 */
fn classify_user_group(user_stats: &UserStatus) -> u8 {
    if user_stats.follow != 0 {
        return 0;
    } else if user_stats.is_fan || user_stats.is_top_fan || user_stats.is_supporter {
        return 1;
    } else {
        return 2;
    }
}
