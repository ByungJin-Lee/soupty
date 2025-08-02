use chrono::{DateTime, Utc};
use soup_sdk::chat::types::UserStatus;
use std::collections::{HashMap, HashSet};

use crate::{
    models::{
        events::{
            DonationEvent, MetadataEvent, MissionEvent, MuteEvent, SubscribeEvent, UserEvent,
        },
        reports::{
            ChatAnalysis, ChatVital, ChatterRank, DonatorRank, EventAnalysis, EventVital, Matrix,
            ModerationAnalysis, ModerationVital, ReportChunk, ReportData, ReportMetadata,
            UserAnalysis, UserHistory, UserVital, WordCount,
        },
    },
    services::{
        addons::data_enrichment::token_analyzer::TokenAnalyzer,
        db::commands::{ChatLogResult, EventLogResult},
    },
};

fn get_user_counts(chat_logs: &[ChatLogResult]) -> [u32; 3] {
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

    counts
}

fn create_user_vital(chat_logs: &[ChatLogResult]) -> UserVital {
    let counts = get_user_counts(chat_logs);

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
        0
    } else if user_stats.is_fan || user_stats.is_top_fan || user_stats.is_supporter {
        1
    } else {
        2
    }
}

fn create_top_chatters(chat_logs: &[ChatLogResult]) -> Vec<ChatterRank> {
    let mut user_message_count: HashMap<String, (soup_sdk::chat::types::User, u64)> =
        HashMap::new();

    for chat in chat_logs {
        user_message_count
            .entry(chat.user.id.clone())
            .and_modify(|(_, count)| *count += 1)
            .or_insert((chat.user.clone(), 1));
    }

    let mut chatters: Vec<_> = user_message_count
        .into_iter()
        .map(|(_, (user, count))| ChatterRank {
            user,
            message_count: count,
        })
        .collect();

    chatters.sort_by(|a, b| b.message_count.cmp(&a.message_count));
    chatters.into_iter().take(10).collect()
}

fn create_popular_words(
    chat_logs: &[ChatLogResult],
    token_analyzer: &TokenAnalyzer,
) -> Vec<WordCount> {
    let mut word_counts: HashMap<String, u64> = HashMap::new();

    for chat in chat_logs {
        let tokens = token_analyzer.tokenize(&chat.message);
        for token in tokens {
            if token.len() >= 2 {
                *word_counts.entry(token).or_insert(0) += 1;
            }
        }
    }

    let mut words: Vec<_> = word_counts
        .into_iter()
        .map(|(word, count)| WordCount { word, count })
        .collect();

    words.sort_by(|a, b| b.count.cmp(&a.count));
    words.into_iter().take(20).collect()
}

fn create_event_vital(event_logs: &[EventLogResult]) -> EventVital {
    let mut donation_count = 0u32;
    let mut donation_amount = 0u64;
    let mut mission_donation_count = 0u32;
    let mut mission_donation_amount = 0u64;
    let mut subscribe_count = 0u32;
    let mut subscribe_renew_count = 0u32;

    for event in event_logs {
        match event.event_type.as_str() {
            "Donation" => {
                if let Ok(donation) = serde_json::from_str::<DonationEvent>(&event.payload) {
                    donation_count += 1;
                    donation_amount += donation.amount as u64;
                }
            }
            "MissionDonation" => {
                if let Ok(mission) = serde_json::from_str::<MissionEvent>(&event.payload) {
                    mission_donation_count += 1;
                    mission_donation_amount += mission.amount as u64;
                    donation_count += 1;
                    donation_amount += mission.amount as u64;
                }
            }
            "Subscribe" => {
                if let Ok(subscribe) = serde_json::from_str::<SubscribeEvent>(&event.payload) {
                    subscribe_count += 1;
                    if subscribe.renew > 0 {
                        subscribe_renew_count += 1;
                    }
                }
            }
            _ => {}
        }
    }

    EventVital {
        donation_count,
        donation_amount,
        mission_donation_count,
        mission_donation_amount,
        subscribe_count,
        subscribe_renew_count,
    }
}

fn create_moderation_vital(event_logs: &[EventLogResult]) -> ModerationVital {
    let mut mute_count: u32 = 0;
    let mut mute_histories: Vec<UserHistory> = Vec::new();
    let mut kick_count: u32 = 0;
    let mut kick_histories: Vec<UserHistory> = Vec::new();

    for event in event_logs {
        match event.event_type.as_str() {
            "Mute" => {
                if let Ok(e) = serde_json::from_str::<MuteEvent>(&event.payload) {
                    mute_count += 1;
                    mute_histories.push(UserHistory {
                        user: e.user,
                        timestamp: e.timestamp,
                        by: Some(e.by),
                    });
                }
            }
            "Kick" => {
                if let Ok(e) = serde_json::from_str::<UserEvent>(&event.payload) {
                    kick_count += 1;
                    kick_histories.push(UserHistory {
                        user: e.user,
                        timestamp: e.timestamp,
                        by: None,
                    });
                }
            }
            _ => {}
        }
    }

    ModerationVital {
        mute_count,
        mute_histories,
        kick_count,
        kick_histories,
    }
}

fn calculate_lol_score(chat_logs: &[ChatLogResult]) -> usize {
    chat_logs
        .iter()
        .filter(|v| v.message.contains("ㅋ"))
        .count()
}

fn create_chat_vital(chat_logs: &[ChatLogResult], token_analyzer: &TokenAnalyzer) -> ChatVital {
    ChatVital {
        total_count: chat_logs.len(),
        lol_score: calculate_lol_score(chat_logs),
        top_chatters: create_top_chatters(chat_logs),
        popular_words: create_popular_words(chat_logs, token_analyzer),
    }
}

pub fn create_report_chunk(
    timestamp: DateTime<Utc>,
    chat_logs: &[ChatLogResult],
    event_logs: &[EventLogResult],
    token_analyzer: &TokenAnalyzer,
) -> ReportChunk {
    let viewer_count = extract_viewer_count_from_events(event_logs);

    ReportChunk {
        timestamp,
        user: create_user_vital(chat_logs),
        chat: create_chat_vital(chat_logs, token_analyzer),
        event: create_event_vital(event_logs),
        moderation: create_moderation_vital(event_logs),
        viewer_count,
    }
}

fn create_top_donators(all_event_logs: &[EventLogResult]) -> Vec<DonatorRank> {
    let mut user_donations: HashMap<String, (String, u64, u64, u64)> = HashMap::new();
    // user_id -> (user_label, donation_count, total_amount, mission_amount)

    for event in all_event_logs {
        match event.event_type.as_str() {
            "Donation" => {
                if let Ok(donation) = serde_json::from_str::<DonationEvent>(&event.payload) {
                    let entry = user_donations.entry(donation.from.clone()).or_insert((
                        donation.from_label.clone(),
                        0,
                        0,
                        0,
                    ));
                    entry.1 += 1; // donation_count
                    entry.2 += donation.amount as u64; // total_amount
                }
            }
            "MissionDonation" => {
                if let Ok(mission) = serde_json::from_str::<MissionEvent>(&event.payload) {
                    let entry = user_donations.entry(mission.from.clone()).or_insert((
                        mission.from_label.clone(),
                        0,
                        0,
                        0,
                    ));
                    entry.1 += 1; // donation_count
                    entry.2 += mission.amount as u64; // total_amount
                    entry.3 += mission.amount as u64; // mission_amount
                }
            }
            _ => {}
        }
    }

    let mut donators: Vec<_> = user_donations
        .into_iter()
        .map(
            |(user_id, (user_label, donation_count, total_amount, mission_amount))| DonatorRank {
                user_id,
                user_label,
                donation_count,
                total_amount,
                mission_amount,
            },
        )
        .collect();

    donators.sort_by(|a, b| b.total_amount.cmp(&a.total_amount));
    donators.into_iter().take(10).collect()
}

fn create_event_analysis(
    chunks: &[ReportChunk],
    all_event_logs: &[EventLogResult],
) -> EventAnalysis {
    let total_donation_count = chunks.iter().map(|c| c.event.donation_count as u64).sum();
    let total_donation_amount = chunks.iter().map(|c| c.event.donation_amount).sum();
    let total_mission_donation_count = chunks
        .iter()
        .map(|c| c.event.mission_donation_count as u64)
        .sum();
    let total_mission_donation_amount =
        chunks.iter().map(|c| c.event.mission_donation_amount).sum();
    let total_subscribe_count = chunks.iter().map(|c| c.event.subscribe_count as u64).sum();
    let total_subscribe_renew_count = chunks
        .iter()
        .map(|c| c.event.subscribe_renew_count as u64)
        .sum();

    let average_donation_amount = if total_donation_count > 0 {
        total_donation_amount as f64 / total_donation_count as f64
    } else {
        0.0
    };

    let top_donators = create_top_donators(all_event_logs);

    EventAnalysis {
        total_donation_count,
        total_donation_amount,
        total_mission_donation_count,
        total_mission_donation_amount,
        average_donation_amount,
        total_subscribe_count,
        total_subscribe_renew_count,
        top_donators,
    }
}

fn create_moderation_analysis(chunks: &[ReportChunk]) -> ModerationAnalysis {
    let total_mute_count = chunks.iter().map(|c| c.moderation.mute_count).sum();
    let total_mute_histories = chunks.iter().fold(Vec::new(), |mut acc, chunk| {
        acc.extend(chunk.moderation.mute_histories.iter().cloned());
        acc
    });
    let total_kick_count = chunks.iter().map(|c| c.moderation.kick_count).sum();
    let total_kick_histories = chunks.iter().fold(Vec::new(), |mut acc, chunk| {
        acc.extend(chunk.moderation.kick_histories.iter().cloned());
        acc
    });

    ModerationAnalysis {
        total_mute_count,
        total_mute_histories,
        total_kick_count,
        total_kick_histories,
    }
}

pub fn create_report_data(
    chunks: Vec<ReportChunk>,
    start_time: DateTime<Utc>,
    end_time: DateTime<Utc>,
    chunk_size: u32,
    all_chat_logs: &[ChatLogResult],
    all_event_logs: &[EventLogResult],
    token_analyzer: &TokenAnalyzer,
) -> Result<ReportData, String> {
    let duration_seconds = end_time.signed_duration_since(start_time).num_seconds() as u64;
    let user_analysis = create_user_analysis(&chunks, all_chat_logs);
    let chat_analysis = create_chat_analysis(&chunks, all_chat_logs, token_analyzer);
    let event_analysis = create_event_analysis(&chunks, all_event_logs);
    let moderation_analysis = create_moderation_analysis(&chunks);

    Ok(ReportData {
        metadata: ReportMetadata {
            duration_seconds,
            start_time,
            end_time: Some(end_time),
            chunk_size,
        },
        user_analysis,
        chat_analysis,
        event_analysis,
        moderation_analysis,
        chunks,
    })
}

fn extract_viewer_count_from_events(event_logs: &[EventLogResult]) -> Option<u64> {
    event_logs
        .iter()
        .rev() // 뒤에서부터 검색하여 최근 값을 빨리 찾음
        .find(|event| event.event_type == "MetadataUpdate")
        .and_then(|event| {
            serde_json::from_str::<MetadataEvent>(&event.payload)
                .ok()
                .map(|metadata| metadata.viewer_count)
        })
}

fn create_chat_analysis(
    chunks: &[ReportChunk],
    all_chat_logs: &[ChatLogResult],
    token_analyzer: &TokenAnalyzer,
) -> ChatAnalysis {
    let total_count = chunks.iter().map(|c| c.chat.total_count as u64).sum();
    let top_chatters = create_top_chatters(all_chat_logs);
    let popular_words = create_popular_words(all_chat_logs, token_analyzer);

    ChatAnalysis {
        total_count,
        top_chatters,
        popular_words,
    }
}

fn create_user_analysis(chunks: &[ReportChunk], chat_logs: &[ChatLogResult]) -> UserAnalysis {
    let overall = get_user_counts(chat_logs);

    let unique = create_chunk_matrix(chunks, |c| c.user.unique_count);
    let fan = create_chunk_matrix(chunks, |c| c.user.fan_count);
    let subscriber = create_chunk_matrix(chunks, |c| c.user.subscriber_count);
    let normal = create_chunk_matrix(chunks, |c| c.user.normal_count);

    UserAnalysis {
        unique: Matrix {
            total: overall.iter().sum(),
            min: unique.0,
            max: unique.1,
            avg: unique.2,
        },
        subscriber: Matrix {
            total: overall[0],
            min: subscriber.0,
            max: subscriber.1,
            avg: subscriber.2,
        },
        fan: Matrix {
            total: overall[1],
            min: fan.0,
            max: fan.1,
            avg: fan.2,
        },
        normal: Matrix {
            total: overall[2],
            min: normal.0,
            max: normal.1,
            avg: normal.2,
        },
    }
}

fn create_chunk_matrix(chunks: &[ReportChunk], getter: fn(&ReportChunk) -> u32) -> (u32, u32, f32) {
    let mut min = u32::MAX;
    let mut max = 0u32;
    let mut sum = 0u32;
    let mut count = 0u32;

    chunks.iter().for_each(|chunk| {
        let value = getter(chunk);
        if value > 0 {
            min = min.min(value);
            max = max.max(value);
            sum += value;
            count += 1;
        }
    });

    if count == 0 {
        (0, 0, 0.0)
    } else {
        (min, max, sum as f32 / count as f32)
    }
}
