import { UserLogEntry, ChatLogMessageType } from "~/services/ipc/types";

const generateRandomMessages = (): string[] => [
  "안녕하세요!",
  "방송 재밌어요~",
  "ㅋㅋㅋㅋㅋㅋ",
  "오늘도 잘 부탁드려요",
  "잘봤습니다!",
  "좋은 방송이네요",
  "채팅창 활발하네요",
  "오늘 컨디션 어떠세요?",
  "음향 깔끔하네요",
  "화질 좋아요!",
  "즐거운 시간이에요",
  "다음에 또 올게요",
  "팬 되었습니다",
  "구독 눌렀어요!",
  "알림설정도 했어요",
  "오늘 날씨 좋네요",
  "주말 잘 보내세요",
  "건강하세요~",
  "파이팅!",
  "응원합니다!",
  "웃음이 절로 나와요",
  "감사합니다",
  "수고하세요!",
  "또 봐요~",
  "잘 듣고 갑니다",
  "좋은 정보 감사해요",
  "유익한 방송이네요",
  "시간 가는 줄 몰랐어요",
  "다음 방송도 기대해요",
  "항상 응원할게요!"
];

const generateRandomUsernames = (): string[] => [
  "햇살좋은날",
  "바람처럼자유롭게",
  "코딩하는사람",
  "게임러버",
  "음악듣는중",
  "책읽는시간",
  "커피한잔의여유",
  "산책좋아해",
  "영화매니아",
  "요리하는재미",
  "여행가고싶어",
  "운동중독자",
  "새벽형인간",
  "밤올빼미",
  "주말이좋아",
  "월요병환자",
  "금요일기다리는중",
  "휴가가절실해",
  "집순이생활",
  "밖이좋아",
  "친구들과시간",
  "가족이최고",
  "반려동물사랑",
  "식물키우기",
  "사진찍기좋아해"
];

export const generateMockUserLogDates = (days: number = 10): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

export const generateMockUserLogsForDate = (
  date: string, 
  userId: string, 
  channelId: string,
  count: number = 50
): UserLogEntry[] => {
  const logs: UserLogEntry[] = [];
  const messages = generateRandomMessages();
  const usernames = generateRandomUsernames();
  
  for (let i = 0; i < count; i++) {
    const baseDate = new Date(date + 'T00:00:00.000Z');
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    const randomSecond = Math.floor(Math.random() * 60);
    
    const timestamp = new Date(baseDate);
    timestamp.setHours(randomHour, randomMinute, randomSecond);
    
    logs.push({
      id: Date.now() + i + Math.random() * 1000,
      broadcastId: 1,
      user: {
        id: userId,
        label: usernames[Math.floor(Math.random() * usernames.length)],
        badge: 0
      },
      logType: "CHAT",
      timestamp: timestamp.toISOString(),
      channelId: channelId,
      channelName: "테스트 채널",
      broadcastTitle: `${date} 방송`,
      messageType: ChatLogMessageType.Text,
      message: messages[Math.floor(Math.random() * messages.length)],
      metadata: undefined,
      eventType: undefined,
      payload: undefined
    });
  }
  
  // 시간순으로 정렬
  return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const createMockChatHistoryService = () => ({
  async getUserLogDates(userId: string, channelId: string): Promise<string[]> {
    // 실제 API 호출 시뮬레이션을 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockUserLogDates(10);
  },

  async searchUserLogs(filters: any, pagination: any) {
    // 실제 API 호출 시뮬레이션을 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const startDate = filters.startDate?.split('T')[0];
    if (!startDate) {
      return { logs: [], totalCount: 0, page: 1, pageSize: 100000, totalPages: 0 };
    }
    
    const logs = generateMockUserLogsForDate(
      startDate, 
      filters.userId, 
      filters.channelId || 'test-channel',
      50
    );
    
    return {
      logs,
      totalCount: logs.length,
      page: 1,
      pageSize: 100000,
      totalPages: 1
    };
  }
});