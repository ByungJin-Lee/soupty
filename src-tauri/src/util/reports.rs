use chrono::{DateTime, Utc};
use soup_sdk::chat::types::UserStatus;
use std::collections::HashSet;

use crate::{
    models::reports::{
        ChatAnalysis, ChatVital, ReportChunk, ReportData, ReportMetadata, UserAnalysis, UserVital,
    },
    services::db::commands::{ChatLogResult, EventLogResult},
};

fn create_user_vital(chat_logs: &[ChatLogResult]) -> UserVital {
    let mut user_set = HashSet::with_capacity(chat_logs.len());
    let mut counts = [0u32; 3]; // [subscriber, fan, normal]

    // 채팅 사용자 처리
    for chat in chat_logs.iter() {
        let user_id = &chat.user.id;
        if user_set.insert(user_id) {
            // 중복 체크와 삽입을 동시에
            let group = classify_user_group(&chat.user.status);
            if group < 3 {
                counts[group as usize] += 1;
            }
        }
    }

    UserVital {
        unique_count: counts.iter().sum(),
        subscriber_count: counts[0],
        fan_count: counts[1],
        normal_count: counts[2],
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

pub fn create_report_chunk(
    chat_logs: &[ChatLogResult],
    _event_logs: &[EventLogResult],
) -> ReportChunk {
    return ReportChunk {
        user: create_user_vital(chat_logs),
        chat: ChatVital {
            total_count: chat_logs.len(),
            top_chatters: Vec::new(),
            popular_words: Vec::new(),
        },
    };
}

pub fn create_report_data(
    chunks: Vec<ReportChunk>,
    start_time: DateTime<Utc>,
    end_time: DateTime<Utc>,
    chunk_size: u32,
) -> Result<ReportData, String> {
    // // 기본 통계 계산
    // let total_chat_count = chat_logs.len() as u64;
    // let total_event_count = event_logs.len() as u64;

    // let unique_users = chat_logs
    //     .iter()
    //     .map(|log| &log.user_id)
    //     .collect::<std::collections::HashSet<_>>()
    //     .len() as u64;

    let duration_seconds = end_time.signed_duration_since(start_time).num_seconds() as u64;

    // // 채팅 분석
    // let mut user_message_count = HashMap::new();
    // let mut word_count = HashMap::new();

    // for log in chat_logs {
    //     *user_message_count.entry(log.user_id.clone()).or_insert(0) += 1;

    //     // 간단한 단어 분석 (공백 기준 분할)
    //     for word in log.message.split_whitespace() {
    //         *word_count.entry(word.to_lowercase()).or_insert(0) += 1;
    //     }
    // }

    // let top_chatters = user_message_count
    //     .into_iter()
    //     .map(|(user_id, count)| {
    //         let username = chat_logs
    //             .iter()
    //             .find(|log| log.user_id == user_id)
    //             .map(|log| log.username.clone())
    //             .unwrap_or_default();

    //         UserStats {
    //             user_id,
    //             username,
    //             message_count: count,
    //             donation_amount: 0, // TODO: 도네이션 정보 계산
    //         }
    //     })
    //     .collect::<Vec<_>>();

    // let popular_words = word_count
    //     .into_iter()
    //     .map(|(word, count)| WordCount { word, count })
    //     .collect::<Vec<_>>();

    // // 이벤트 분석
    // let donation_total = 0u64;
    // let mut donation_count = 0u64;
    // let mut subscription_count = 0u64;
    // let mut moderation_stats = ModerationStats {
    //     kicks: 0,
    //     mutes: 0,
    //     bans: 0,
    //     freezes: 0,
    // };

    // for log in event_logs {
    //     match log.event_type.as_str() {
    //         "Donation" => {
    //             donation_count += 1;
    //             // TODO: payload에서 실제 도네이션 금액 파싱
    //         }
    //         "Subscribe" => subscription_count += 1,
    //         "Kick" => moderation_stats.kicks += 1,
    //         "Mute" => moderation_stats.mutes += 1,
    //         "Black" => moderation_stats.bans += 1,
    //         "Freeze" => moderation_stats.freezes += 1,
    //         _ => {}
    //     }
    // }

    Ok(ReportData {
        metadata: ReportMetadata {
            duration_seconds,
            start_time,
            end_time: Some(end_time),
            chunk_size,
        },
        chat_analysis: ChatAnalysis { total_count: 0 },
        user_analysis: UserAnalysis {
            unique_count: 0,
            subscriber_count: 0,
            fan_count: 0,
            normal_count: 0,
        },
        chunks,
    })
}
