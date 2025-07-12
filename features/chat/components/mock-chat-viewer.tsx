"use client";

import { Badge } from "~/types/badge";
import { ChatEvent, ChatType, MessageType } from "~/types/event/chat";
import { ChatView } from "./chat-view";

const mockUsers = [
  { id: "user1", label: "채팅왕123", isManager: false, isFan: true, isTopFan: false },
  { id: "user2", label: "소울이팬", isManager: false, isFan: false, isTopFan: true },
  { id: "user3", label: "매니저박", isManager: true, isFan: false, isTopFan: false },
  { id: "user4", label: "일반유저", isManager: false, isFan: false, isTopFan: false },
  { id: "user5", label: "VIP회원", isManager: false, isFan: true, isTopFan: true },
  { id: "user6", label: "구독자", isManager: false, isFan: true, isTopFan: false },
  { id: "user7", label: "신규유저", isManager: false, isFan: false, isTopFan: false },
  { id: "user8", label: "열성팬", isManager: false, isFan: true, isTopFan: false },
];

const mockMessages = [
  "안녕하세요!",
  "오늘 방송 재밌네요 ㅋㅋ",
  "채팅 테스트입니다",
  "이모티콘도 있나요? 😊",
  "방송 잘 보고 있어요",
  "질문이 있는데요",
  "ㅋㅋㅋㅋㅋㅋ",
  "오늘 뭐 하실 예정인가요?",
  "팬 되었어요!",
  "매니저님 안녕하세요",
  "처음 방송 보는데 재밌네요",
  "구독 눌렀습니다!",
  "채팅방 분위기 좋네요",
  "다음 방송 언제 하나요?",
  "게임 잘하시네요",
  "응원합니다!",
  "ㅎㅎㅎㅎㅎ",
  "오늘도 고생하세요",
  "재밌는 방송 감사해요",
  "채팅 많이 올라오네요",
];

const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
];

function generateMockChatEvent(index: number): ChatEvent {
  const user = mockUsers[index % mockUsers.length];
  const message = mockMessages[index % mockMessages.length];
  const timestamp = Date.now() - (40 - index) * 10000; // 10초 간격으로 과거부터
  
  const badges: Badge[] = [];
  if (user.isManager) badges.push(Badge.Manager);
  if (user.isTopFan) badges.push(Badge.TopFan);
  if (user.isFan) badges.push(Badge.Fan);

  return {
    id: `mock-chat-${index}`,
    timestamp,
    comment: message,
    type: user.isManager ? ChatType.Manager : ChatType.Common,
    user: {
      id: user.id,
      label: user.label,
      status: {
        isBj: false,
        follow: user.isFan ? 1 : 0,
        isManager: user.isManager,
        isTopFan: user.isTopFan,
        isFan: user.isFan,
        isSupporter: false,
      },
      subscribe: {
        acc: user.isFan ? Math.floor(Math.random() * 12) + 1 : 0,
        current: user.isFan ? Math.floor(Math.random() * 3) + 1 : 0,
      },
    },
    isAdmin: user.isManager,
    ogq: undefined,
    parts: [
      {
        type: MessageType.Text,
        value: message,
      },
    ],
    badges,
    color: colors[index % colors.length],
  };
}

const mockChatData: ChatEvent[] = Array.from({ length: 40 }, (_, i) => 
  generateMockChatEvent(i)
);

type Props = {
  className?: string;
};

export const MockChatViewer: React.FC<Props> = ({ className = "" }) => {
  return <ChatView messages={mockChatData} className={className} />;
};