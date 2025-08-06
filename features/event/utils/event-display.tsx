import React from "react";
import { EVENT_COLOR_MAP } from "~/constants";
import { ChatRow } from "~/features/chat/components/chat-row";
import { DonationRow } from "~/features/event/components/events/donation";
import {
  EnterRow,
  ExitRow,
} from "~/features/event/components/events/enter-exit";
import { GiftRow } from "~/features/event/components/events/gift";
import {
  BJStateChangeRow,
  ConnectedRow,
  DisconnectedRow,
} from "~/features/event/components/events/lifecycle";
import {
  BattleMissionResultRow,
  ChallengeMissionResultRow,
  MissionDonationRow,
  MissionTotalRow,
} from "~/features/event/components/events/mission";
import {
  BlackRow,
  FreezeRow,
  KickCancelRow,
  KickRow,
  MuteRow,
  SlowRow,
} from "~/features/event/components/events/moderation";
import { NotificationRow } from "~/features/event/components/events/notification";
import { StickerRow } from "~/features/event/components/events/sticker";
import { SubscribeRow } from "~/features/event/components/events/subscribe";
import {
  DomainEvent,
  DomainEventType,
  DonationType,
  donationTypeLabel,
  missionTypeLabel,
  unpackGift,
} from "~/types";

export interface EventDisplayConfig {
  showTimestamp?: boolean;
  showChannel?: boolean;
  showBroadcast?: boolean;
  showUser?: boolean;
}

export interface UserInfo {
  id: string;
  label: string;
}

export class EventDisplayUtil {
  static getEventTypeColor(eventType: DomainEventType): string {
    return EVENT_COLOR_MAP[eventType];
  }

  static extractUser(event: DomainEvent): UserInfo {
    switch (event.type) {
      case DomainEventType.Donation:
        return {
          id: event.payload.from || "",
          label: event.payload.fromLabel || "",
        };

      case DomainEventType.Sticker:
        return {
          id: event.payload.from || "",
          label: event.payload.fromLabel || "",
        };

      case DomainEventType.Gift:
        return {
          id: event.payload.senderId || "",
          label: event.payload.senderLabel || "",
        };

      case DomainEventType.Subscribe:
        return {
          id: event.payload.userId || "",
          label: event.payload.label || "",
        };

      case DomainEventType.MissionDonation:
        return {
          id: event.payload.from || "",
          label: event.payload.fromLabel || "",
        };

      case DomainEventType.Mute:
        return {
          id: event.payload.user?.id || "",
          label: event.payload.user?.label || "",
        };

      case DomainEventType.Kick:
        return {
          id: event.payload.user?.id || "",
          label: event.payload.user?.label || "",
        };

      case DomainEventType.KickCancel:
        return {
          id: event.payload.userId || "",
          label: "",
        };

      case DomainEventType.Black:
        return {
          id: event.payload.userId || "",
          label: "",
        };

      case DomainEventType.Enter:
        return {
          id: event.payload.user?.id || "",
          label: event.payload.user?.label || "",
        };

      case DomainEventType.Exit:
        return {
          id: event.payload.user?.id || "",
          label: event.payload.user?.label || "",
        };

      default:
        return {
          id: "",
          label: "",
        };
    }
  }

  static renderEventContent(event: DomainEvent): React.ReactNode {
    try {
      switch (event.type) {
        case DomainEventType.Chat:
          return null;

        case DomainEventType.Gift:
          return (
            <div>
              <div>
                <span className={this.getEventTypeColor(event.type)}>
                  {unpackGift(event.payload.giftType, event.payload.giftCode)}
                </span>{" "}
                선물
              </div>
              <div className="text-sm text-gray-600">
                to. {event.payload.receiverLabel}
              </div>
            </div>
          );

        case DomainEventType.Sticker:
          return (
            <div>
              <div>
                <span className={this.getEventTypeColor(event.type)}>
                  {event.payload.amount}
                </span>
                개 후원
              </div>
              {event.payload.supporterOrdinal > 0 && (
                <div className="text-sm text-gray-600">
                  서포터 가입 {event.payload.supporterOrdinal}번째
                </div>
              )}
            </div>
          );

        case DomainEventType.Donation:
          return (
            <div>
              <div>
                <span className={this.getEventTypeColor(event.type)}>
                  {event.payload.amount}
                </span>
                개 후원
                <span className="ml-2 text-sm">
                  (
                  {
                    donationTypeLabel[
                      event.payload.donationType as DonationType
                    ]
                  }
                  )
                </span>
              </div>
              {event.payload.message && (
                <div className="text-gray-900 break-all">
                  &quot;{event.payload.message}&quot;
                </div>
              )}
              {event.payload.becomeTopFan && (
                <div className="text-sm text-gray-600">• 새로운 탑팬!</div>
              )}
              {event.payload.fanClubOrdinal > 0 && (
                <div className="text-sm text-gray-600">
                  팬가입 {event.payload.fanClubOrdinal}번째
                </div>
              )}
            </div>
          );

        case DomainEventType.Subscribe:
          return (
            <div>
              <div className="text-sm text-gray-600">
                티어: {event.payload.tier} •
                {event.payload.renew > 0
                  ? event.payload.renew + "개월"
                  : "신규"}
              </div>
            </div>
          );

        case DomainEventType.MissionDonation:
          return (
            <div>
              <div className="font-medium">{event.payload.amount}개</div>
              <div className="text-sm text-gray-600">
                미션 타입: {event.payload.missionType}
              </div>
            </div>
          );

        case DomainEventType.MissionTotal:
          return (
            <div className="font-medium">
              총합: {event.payload.amount}개 ({event.payload.missionType})
            </div>
          );

        case DomainEventType.ChallengeMissionResult:
          return (
            <div>
              <div
                className={`font-medium ${
                  event.payload.isSuccess ? "text-green-600" : "text-red-600"
                }`}
              >
                {event.payload.isSuccess ? "성공" : "실패"}
              </div>
              <div className="text-gray-900">{event.payload.title}</div>
            </div>
          );

        case DomainEventType.BattleMissionResult:
          return (
            <div>
              <div className="font-medium">
                {event.payload.isDraw
                  ? "무승부"
                  : `${event.payload.winner} 승리`}
              </div>
              <div className="text-gray-900">{event.payload.title}</div>
            </div>
          );

        case DomainEventType.Mute:
          return (
            <div>
              <div className="font-medium">
                {event.payload.seconds}초 • 누적: {event.payload.counts}회
              </div>
              <div className="text-sm text-gray-600">
                실행자: {event.payload.by}
              </div>
            </div>
          );

        case DomainEventType.Kick:
          return <div className="font-medium">강제퇴장</div>;

        case DomainEventType.KickCancel:
          return (
            <div className="font-medium">
              취소됨 (사용자 ID: {event.payload.userId})
            </div>
          );

        case DomainEventType.Black:
          return (
            <div className="font-medium">
              블랙리스트 추가 (ID: {event.payload.userId})
            </div>
          );

        case DomainEventType.Freeze:
          return (
            <div>
              <div className="font-medium">
                {event.payload.freezed ? "활성화" : "비활성화"}
              </div>
              <div className="text-sm text-gray-600">
                구독 {event.payload.limitSubscriptionMonth}개월 이상 • 풍선{" "}
                {event.payload.limitBalloons}개 이상
              </div>
              {event.payload.targets?.length > 0 && (
                <div className="text-sm text-gray-600">
                  대상: {event.payload.targets.join(", ")}
                </div>
              )}
            </div>
          );

        case DomainEventType.Slow:
          return (
            <div className="font-medium">{event.payload.duration}초 간격</div>
          );

        case DomainEventType.Notification:
          return (
            <div>
              <div className="text-gray-900 break-all">
                {event.payload.message}
              </div>
              <div className="text-sm text-gray-600">
                표시: {event.payload.show ? "예" : "아니오"}
              </div>
            </div>
          );

        case DomainEventType.Enter:
          return <div>{event.payload.user?.label}님이 입장</div>;

        case DomainEventType.Exit:
          return <div>{event.payload.user?.label}님이 퇴장</div>;

        case DomainEventType.Connected:
          return <div>연결됨</div>;

        case DomainEventType.Disconnected:
          return <div>연결 해제됨</div>;

        case DomainEventType.BJStateChange:
          return <div>BJ 상태 변경</div>;

        default:
          return (
            <div className="text-gray-900 break-all">
              {JSON.stringify(event.payload)}
            </div>
          );
      }
    } catch {
      return (
        <div className="text-gray-900 break-all">
          {JSON.stringify(event.payload)}
        </div>
      );
    }
  }

  static exportEventRow(event: DomainEvent): React.ReactNode {
    switch (event.type) {
      // Lifecycle events
      case DomainEventType.Connected:
        return <ConnectedRow data={event.payload} />;
      case DomainEventType.Disconnected:
        return <DisconnectedRow data={event.payload} />;
      case DomainEventType.BJStateChange:
        return <BJStateChangeRow data={event.payload} />;

      // Chat related events
      case DomainEventType.Chat:
        return <ChatRow data={event.payload} />;
      case DomainEventType.Donation:
        return <DonationRow data={event.payload} />;
      case DomainEventType.Subscribe:
        return <SubscribeRow data={event.payload} />;
      case DomainEventType.Sticker:
        return <StickerRow data={event.payload} />;
      case DomainEventType.Gift:
        return <GiftRow data={event.payload} />;

      // User events
      case DomainEventType.Enter:
        return <EnterRow data={event.payload} />;
      case DomainEventType.Exit:
        return <ExitRow data={event.payload} />;

      // Moderation events
      case DomainEventType.Kick:
        return <KickRow data={event.payload} />;
      case DomainEventType.KickCancel:
        return <KickCancelRow data={event.payload} />;
      case DomainEventType.Mute:
        return <MuteRow data={event.payload} />;
      case DomainEventType.Black:
        return <BlackRow data={event.payload} />;
      case DomainEventType.Freeze:
        return <FreezeRow data={event.payload} />;
      case DomainEventType.Slow:
        return <SlowRow data={event.payload} />;

      // Mission events
      case DomainEventType.MissionDonation:
        return <MissionDonationRow data={event.payload} />;
      case DomainEventType.MissionTotal:
        return <MissionTotalRow data={event.payload} />;
      case DomainEventType.ChallengeMissionResult:
        return <ChallengeMissionResultRow data={event.payload} />;
      case DomainEventType.BattleMissionResult:
        return <BattleMissionResultRow data={event.payload} />;

      // System events
      case DomainEventType.Notification:
        return <NotificationRow data={event.payload} />;

      case DomainEventType.MetadataUpdate:
        return null;
      default:
        return (
          <div className="my-0.5 p-1 rounded-md bg-gray-100">
            알 수 없는 이벤트
          </div>
        );
    }
  }

  static exportHistory(event: DomainEvent): React.ReactNode {
    return this.renderEventContent(event);
  }

  static exportSummary(e: DomainEvent): React.ReactNode {
    switch (e.type) {
      case DomainEventType.Mute:
        return (
          <span className={this.getEventTypeColor(e.type)}>
            채팅금지({e.payload.counts}회) by.{e.payload.by}
          </span>
        );
      case DomainEventType.Donation:
        return (
          <span className={this.getEventTypeColor(e.type)}>
            {donationTypeLabel[e.payload.donationType]} {e.payload.amount}개
            {e.payload.fanClubOrdinal > 0
              ? `(${e.payload.fanClubOrdinal}번째 팬)`
              : null}
          </span>
        );
      case DomainEventType.MissionDonation:
        return (
          <span className={this.getEventTypeColor(e.type)}>
            {missionTypeLabel[e.payload.missionType]} {e.payload.amount}개
          </span>
        );
      case DomainEventType.Gift:
        return (
          <span className={this.getEventTypeColor(e.type)}>
            {unpackGift(e.payload.giftType, e.payload.giftCode)} 선물
          </span>
        );
      case DomainEventType.Sticker:
        return (
          <span className={this.getEventTypeColor(e.type)}>
            스티커 {e.payload.amount}개{" "}
            {e.payload.supporterOrdinal > 0
              ? `(${e.payload.supporterOrdinal}번째 서포터)`
              : null}
          </span>
        );
      case DomainEventType.Subscribe:
        return (
          <span className={this.getEventTypeColor(e.type)}>
            구독 {e.payload.tier}티어 (
            {e.payload.renew > 0 ? e.payload.renew + "개월" : "신규"})
          </span>
        );
      case DomainEventType.Kick:
        return <span className={this.getEventTypeColor(e.type)}>강제퇴장</span>;
      case DomainEventType.Enter:
        return (
          <span className={this.getEventTypeColor(e.type)}>
            {e.payload.user?.label}님 입장
          </span>
        );
      case DomainEventType.Exit:
        return (
          <span className={this.getEventTypeColor(e.type)}>
            {e.payload.user?.label}님 퇴장
          </span>
        );
      case DomainEventType.Connected:
        return <span className={this.getEventTypeColor(e.type)}>연결됨</span>;
      case DomainEventType.Disconnected:
        return (
          <span className={this.getEventTypeColor(e.type)}>연결 해제됨</span>
        );
      case DomainEventType.Notification:
        return (
          <span className={this.getEventTypeColor(e.type)}>
            알림: {e.payload.message}
          </span>
        );
      default:
        return <span className={this.getEventTypeColor(e.type)}>이벤트</span>;
    }
  }
}
