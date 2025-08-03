"use client";

import { GiftType } from "~/types";
import { DomainEvent, DomainEventType } from "~/types/event/domain";
import { DonationType } from "~/types/event/donation";
import { MissionType } from "~/types/event/mission";
import { EventView } from "./event-view";

const mockUsernames = [
  "별풍선왕",
  "후원천사",
  "팬클럽장",
  "구독왕",
  "열혈팬123",
  "응원단장",
  "별빛요정",
  "도네이터",
  "서포터",
  "충성팬",
  "별풍선러버",
  "후원마니아",
  "VIP회원",
  "스트리머팬",
  "굿팬",
];

const donationMessages = [
  "항상 응원합니다!",
  "재밌는 방송 감사해요",
  "오늘도 화이팅!",
  "별풍선 드립니다~",
  "좋은 방송 계속해주세요",
  "팬이에요❤️",
  "늘 건강하세요",
  "방송 잘 보고 있어요",
  "힘내세요!",
  "최고의 스트리머",
  null, // 메시지 없는 경우
  null,
  "감사합니다",
  "응원해요!",
  "좋아요👍",
];

function generateMockDonationEvent(index: number): DomainEvent {
  const timestamp = new Date().toISOString();
  const username = mockUsernames[index % mockUsernames.length];
  const amount = [10, 50, 100, 500, 1000, 2000][index % 6];
  const message = donationMessages[index % donationMessages.length];

  return {
    id: `mock-donation-${index}`,
    type: DomainEventType.Donation,
    payload: {
      id: `mock-donation-${index}`,
      timestamp,
      amount,
      becomeTopFan: index % 10 === 0, // 10번에 1번 열혈팬
      channelId: "mock-channel",
      donationType:
        index % 2 === 0 ? DonationType.Balloon : DonationType.ADBalloon,
      fanClubOrdinal: index % 10 === 0 ? index / 10 + 1 : 0,
      from: `user-${index}`,
      fromLabel: username,
      message,
    },
  };
}

function generateMockStickerEvent(index: number): DomainEvent {
  const timestamp = new Date().toISOString();
  const username = mockUsernames[index % mockUsernames.length];
  const amount = [10, 50, 100, 500, 1000, 2000][index % 6];

  return {
    id: `mock-sticker-${index}`,
    type: DomainEventType.Sticker,
    payload: {
      id: `mock-sticker-${index}`,
      channelId: "ssss",
      timestamp,
      amount,
      supporterOrdinal: 1,
      from: username,
      fromLabel: username,
    },
  };
}

function generateMockGiftEvent(index: number): DomainEvent {
  const timestamp = new Date().toISOString();
  const username = mockUsernames[index % mockUsernames.length];

  return {
    id: `mock-gift-${index}`,
    type: DomainEventType.Gift,
    payload: {
      id: `mock-gift-${index}`,
      channelId: "ssss",
      timestamp,
      senderId: username,
      senderLabel: username,
      receiverId: "ddd",
      receiverLabel: "ddd",
      giftType: GiftType.Subscription,
      giftCode: "3",
    },
  };
}

function generateMockSubscribeEvent(index: number): DomainEvent {
  const timestamp = new Date().toISOString();
  const username = mockUsernames[index % mockUsernames.length];
  const tier = [1, 2][index % 2];
  const renew = [1, 3, 6, 12][index % 4];

  return {
    id: `mock-subscribe-${index}`,
    type: DomainEventType.Subscribe,
    payload: {
      id: `mock-subscribe-${index}`,
      timestamp,
      channelId: "mock-channel",
      label: username,
      renew,
      tier,
      userId: `user-${index}`,
    },
  };
}

function generateMockEnterEvent(index: number): DomainEvent {
  const timestamp = new Date().toISOString();
  const username = mockUsernames[index % mockUsernames.length];

  return {
    id: `mock-enter-${index}`,
    type: DomainEventType.Enter,
    payload: {
      id: `mock-enter-${index}`,
      timestamp,
      channelId: "mock-channel",
      user: {
        id: `user-${index}`,
        label: username,
        status: {
          isBj: false,
          follow: 0,
          isManager: false,
          isTopFan: false,
          isFan: false,
          isSupporter: false,
        },
        subscribe: { acc: 0, current: 0 },
      },
    },
  };
}

function generateMockMuteEvent(index: number): DomainEvent {
  const timestamp = new Date().toISOString();
  const username = mockUsernames[index % mockUsernames.length];

  return {
    id: `mock-mute-${index}`,
    type: DomainEventType.Mute,
    payload: {
      id: `mock-mute-${index}`,
      timestamp,
      channelId: "mock-channel",
      user: {
        id: `user-${index}`,
        label: username,
        status: {
          isBj: false,
          follow: 0,
          isManager: false,
          isTopFan: false,
          isFan: false,
          isSupporter: false,
        },
        subscribe: { acc: 0, current: 0 },
      },
      seconds: [30, 60, 300, 600][index % 4],
      message: "채팅 규칙 위반",
      by: "매니저",
      counts: 1,
      superuserType: "manager",
    },
  };
}

function generateMockMissionEvent(index: number): DomainEvent {
  const timestamp = new Date().toISOString();
  const username = mockUsernames[index % mockUsernames.length];

  return {
    id: `mock-mission-${index}`,
    type: DomainEventType.MissionDonation,
    payload: {
      id: `mock-mission-${index}`,
      timestamp,
      channelId: "mock-channel",
      from: `user-${index}`,
      fromLabel: username,
      amount: [10, 50, 100][index % 3],
      missionType: index % 2 === 0 ? MissionType.Challenge : MissionType.Battle,
    },
  };
}

function generateMockNotificationEvent(index: number): DomainEvent {
  const timestamp = new Date().toISOString();
  const messages = [
    "방송을 시작했습니다!",
    "후원 이벤트가 시작되었습니다",
    "새로운 게임을 시작합니다",
    "잠시 후 방송이 종료됩니다",
  ];

  return {
    id: `mock-notification-${index}`,
    type: DomainEventType.Notification,
    payload: {
      id: `mock-notification-${index}`,
      timestamp,
      channelId: "mock-channel",
      message: messages[index % messages.length],
      show: true,
    },
  };
}

const mockEventData: DomainEvent[] = Array.from({ length: 40 }, (_, i) => {
  const eventType = i % 8;
  switch (eventType) {
    case 0:
      return generateMockStickerEvent(i);
    case 1:
      return generateMockGiftEvent(i);
    case 2: // 30% 도네이션
      return generateMockDonationEvent(i);
    case 3:
    case 4: // 20% 구독
      return generateMockSubscribeEvent(i);
    case 5: // 15% 입장
      return generateMockEnterEvent(i);
    case 6: // 15% 뮤트
      return generateMockMuteEvent(i);
    case 7: // 10% 미션
      return generateMockMissionEvent(i);
    default: // 10% 알림
      return generateMockNotificationEvent(i);
  }
});

type Props = {
  className?: string;
};

export const MockEventViewer: React.FC<Props> = ({ className = "" }) => {
  return <EventView events={mockEventData} className={className} />;
};
