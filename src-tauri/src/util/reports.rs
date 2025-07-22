use chrono::{DateTime, Utc};
use soup_sdk::chat::types::UserStatus;
use std::collections::HashSet;

use crate::{
    models::{
        events::MetadataEvent,
        reports::{
            ChatAnalysis, ChatVital, ReportChunk, ReportData, ReportMetadata, UserAnalysis,
            UserVital,
        },
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
    event_logs: &[EventLogResult],
) -> ReportChunk {
    let viewer_count = extract_viewer_count_from_events(event_logs);

    ReportChunk {
        user: create_user_vital(chat_logs),
        chat: ChatVital {
            total_count: chat_logs.len(),
            top_chatters: Vec::new(),
            popular_words: Vec::new(),
        },
        viewer_count,
    }
}

pub fn create_report_data(
    chunks: Vec<ReportChunk>,
    start_time: DateTime<Utc>,
    end_time: DateTime<Utc>,
    chunk_size: u32,
    all_chat_logs: &[ChatLogResult],
) -> Result<ReportData, String> {
    let duration_seconds = end_time.signed_duration_since(start_time).num_seconds() as u64;
    let user_analysis = create_overall_user_analysis(all_chat_logs);

    Ok(ReportData {
        metadata: ReportMetadata {
            duration_seconds,
            start_time,
            end_time: Some(end_time),
            chunk_size,
        },
        chat_analysis: ChatAnalysis {
            total_count: chunks.iter().map(|c| c.chat.total_count as u64).sum(),
        },
        user_analysis,
        chunks,
    })
}

fn extract_viewer_count_from_events(event_logs: &[EventLogResult]) -> Option<u64> {
    event_logs
        .iter()
        .filter(|event| event.event_type == "MetadataUpdate")
        .filter_map(|event| {
            serde_json::from_str::<MetadataEvent>(&event.payload)
                .ok()
                .map(|metadata| metadata.viewer_count)
        })
        .last() // 가장 최근 viewer_count 사용
}

fn create_overall_user_analysis(chat_logs: &[ChatLogResult]) -> UserAnalysis {
    let mut user_set = HashSet::with_capacity(chat_logs.len());
    let mut counts = [0u32; 3]; // [subscriber, fan, normal]

    for chat in chat_logs.iter() {
        let user_id = &chat.user.id;
        if user_set.insert(user_id) {
            let group = classify_user_group(&chat.user.status);
            if group < 3 {
                counts[group as usize] += 1;
            }
        }
    }

    UserAnalysis {
        unique_count: counts.iter().sum(),
        subscriber_count: counts[0],
        fan_count: counts[1],
        normal_count: counts[2],
    }
}
