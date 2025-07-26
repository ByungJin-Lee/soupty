mod constants;
mod donation_correlator;

use soup_sdk::chat::Event as SdkEvent;
use uuid::Uuid;

use crate::models::events::*;
use donation_correlator::DonationCorrelator;

pub use constants::DONATION_FLUSH_INTERVAL_MS;

pub struct EventMapper {
    donation_correlator: DonationCorrelator,
}

impl EventMapper {
    pub fn new() -> Self {
        Self {
            donation_correlator: DonationCorrelator::new(),
        }
    }

    pub fn process_event(&mut self, channel_id: &str, sdk_event: &SdkEvent) -> Option<DomainEvent> {
        match sdk_event {
            SdkEvent::Chat(sdk_chat) => {
                // 대기 중인 donation에 첫 번째 채팅만 추가
                self.donation_correlator.try_link_chat_to_donation(
                    &sdk_chat.user.id,
                    &sdk_chat.user.label,
                    &sdk_chat.comment,
                    sdk_chat.meta.received_time,
                );

                // 채팅 이벤트를 즉시 반환
                Some(DomainEvent::Chat(ChatEvent {
                    id: Uuid::new_v4(),
                    timestamp: sdk_chat.meta.received_time,
                    channel_id: channel_id.to_string(),
                    comment: sdk_chat.comment.clone(),
                    chat_type: sdk_chat.chat_type.clone(),
                    user: sdk_chat.user.clone(),
                    is_admin: sdk_chat.is_admin,
                    ogq: sdk_chat.emoticon.clone(),
                }))
            }
            SdkEvent::Donation(sdk_donation) => {
                // donation 이벤트는 200ms 지연 처리를 위해 큐에 저장
                self.donation_correlator.add_pending_donation(
                    sdk_donation.from.clone(),
                    channel_id.to_string(),
                    sdk_donation.from.clone(),
                    sdk_donation.from_label.clone(),
                    sdk_donation.amount,
                    sdk_donation.fan_club_ordinal,
                    sdk_donation.become_top_fan,
                    sdk_donation.donation_type.clone(),
                    sdk_donation.meta.received_time,
                );

                // donation은 즉시 반환하지 않음
                None
            }
            _ => {
                // 다른 이벤트들은 기존 방식으로 처리
                map_sdk_to_domain_legacy(channel_id, sdk_event)
            }
        }
    }

    pub fn flush_expired_donations(&mut self) -> Vec<DomainEvent> {
        self.donation_correlator
            .flush_expired_donations()
            .into_iter()
            .map(DomainEvent::Donation)
            .collect()
    }

    /// 현재 대기 중인 후원 이벤트 수 (디버깅/모니터링용)
    #[allow(dead_code)]
    pub fn pending_donations_count(&self) -> usize {
        self.donation_correlator.pending_count()
    }
}

/// 기존 방식의 SDK 이벤트를 도메인 이벤트로 변환 (Chat, Donation 제외)
fn map_sdk_to_domain_legacy(channel_id: &str, sdk_event: &SdkEvent) -> Option<DomainEvent> {
    match sdk_event {
        // 생명 주기 이벤트
        SdkEvent::Connected => Some(DomainEvent::Connected),
        SdkEvent::Disconnected => Some(DomainEvent::Disconnected),

        // 채팅 관련 이벤트
        SdkEvent::BJStateChange => Some(DomainEvent::BJStateChange),

        // Chat은 새로운 EventMapper에서 처리하므로 제외
        SdkEvent::Chat(_) => None,

        SdkEvent::Kick(sdk_kick) => Some(DomainEvent::Kick(UserEvent {
            id: Uuid::new_v4(),
            timestamp: sdk_kick.meta.received_time,
            channel_id: channel_id.to_string(),
            user: sdk_kick.user.clone(),
        })),

        // Donation은 새로운 EventMapper에서 처리하므로 제외
        SdkEvent::Donation(_) => None,

        SdkEvent::Subscribe(sdk_subscribe) => Some(DomainEvent::Subscribe(SubscribeEvent {
            id: Uuid::new_v4(),
            timestamp: sdk_subscribe.meta.received_time,
            channel_id: channel_id.to_string(),
            user_id: sdk_subscribe.user_id.clone(),
            label: sdk_subscribe.label.clone(),
            tier: sdk_subscribe.tier,
            renew: sdk_subscribe.renew,
        })),

        SdkEvent::KickCancel(sdk_user) => Some(DomainEvent::KickCancel(SimplifiedUserEvent {
            id: Uuid::new_v4(),
            timestamp: sdk_user.meta.received_time,
            channel_id: channel_id.to_string(),
            user_id: sdk_user.user_id.clone(),
        })),

        SdkEvent::Mute(sdk_mute) => Some(DomainEvent::Mute(MuteEvent {
            id: Uuid::new_v4(),
            timestamp: sdk_mute.meta.received_time,
            channel_id: channel_id.to_string(),
            user: sdk_mute.user.clone(),
            seconds: sdk_mute.seconds,
            message: sdk_mute.message.clone(),
            by: sdk_mute.by.clone(),
            counts: sdk_mute.counts,
            superuser_type: sdk_mute.superuser_type.clone(),
        })),

        SdkEvent::Black(sdk_user) => Some(DomainEvent::Black(SimplifiedUserEvent {
            id: Uuid::new_v4(),
            timestamp: sdk_user.meta.received_time,
            channel_id: channel_id.to_string(),
            user_id: sdk_user.user_id.clone(),
        })),

        SdkEvent::Freeze(sdk_freeze) => Some(DomainEvent::Freeze(FreezeEvent {
            id: Uuid::new_v4(),
            timestamp: sdk_freeze.meta.received_time,
            channel_id: channel_id.to_string(),
            freezed: sdk_freeze.freezed,
            limit_subscription_month: sdk_freeze.limit_subscription_month,
            limit_balloons: sdk_freeze.limit_balloons,
            targets: sdk_freeze.targets.clone(),
        })),

        SdkEvent::Notification(sdk_notification) => {
            Some(DomainEvent::Notification(NotificationEvent {
                id: Uuid::new_v4(),
                timestamp: sdk_notification.meta.received_time,
                channel_id: channel_id.to_string(),
                message: sdk_notification.message.clone(),
                show: sdk_notification.show,
            }))
        }

        SdkEvent::MissionDonation(sdk_mission) => {
            Some(DomainEvent::MissionDonation(MissionEvent {
                id: Uuid::new_v4(),
                timestamp: sdk_mission.meta.received_time,
                channel_id: channel_id.to_string(),
                from: sdk_mission.from.clone(),
                from_label: sdk_mission.from_label.clone(),
                amount: sdk_mission.amount,
                mission_type: sdk_mission.mission_type.clone(),
            }))
        }

        SdkEvent::MissionTotal(sdk_mission_total) => {
            Some(DomainEvent::MissionTotal(MissionTotalEvent {
                id: Uuid::new_v4(),
                timestamp: sdk_mission_total.meta.received_time,
                channel_id: channel_id.to_string(),
                mission_type: sdk_mission_total.mission_type.clone(),
                amount: sdk_mission_total.amount,
            }))
        }

        SdkEvent::BattleMissionResult(sdk_battle) => {
            Some(DomainEvent::BattleMissionResult(BattleMissionResultEvent {
                id: Uuid::new_v4(),
                timestamp: sdk_battle.meta.received_time,
                channel_id: channel_id.to_string(),
                is_draw: sdk_battle.is_draw,
                winner: sdk_battle.winner.clone(),
                title: sdk_battle.title.clone(),
            }))
        }

        SdkEvent::ChallengeMissionResult(sdk_challenge) => Some(
            DomainEvent::ChallengeMissionResult(ChallengeMissionResultEvent {
                id: Uuid::new_v4(),
                timestamp: sdk_challenge.meta.received_time,
                channel_id: channel_id.to_string(),
                is_success: sdk_challenge.is_success,
                title: sdk_challenge.title.clone(),
            }),
        ),

        SdkEvent::Slow(sdk_slow) => Some(DomainEvent::Slow(SlowEvent {
            id: Uuid::new_v4(),
            timestamp: sdk_slow.meta.received_time,
            channel_id: channel_id.to_string(),
            duration: sdk_slow.duration,
        })),

        // 처리하지 않는 이벤트들
        _ => None,
    }
}
