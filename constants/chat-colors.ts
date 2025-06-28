/**
 * 채팅 닉네임에 사용될 컬러 팔레트
 * White mode에 최적화된 10가지 색상
 * 가독성과 접근성을 고려하여 충분한 대비를 가진 색상들
 */
export const CHAT_NICKNAME_COLORS = [
  "#E53E3E", // Red - 활기찬 빨강
  "#D69E2E", // Orange - 따뜻한 오렌지  
  "#38A169", // Green - 자연스러운 초록
  "#3182CE", // Blue - 신뢰감 있는 파랑
  "#805AD5", // Purple - 우아한 보라
  "#D53F8C", // Pink - 생동감 있는 핑크
  "#00B5D8", // Cyan - 시원한 청록
  "#DD6B20", // Orange-Red - 역동적인 주황
  "#319795", // Teal - 차분한 청록
  "#553C9A", // Indigo - 깊이 있는 남보라
] as const;

/**
 * 색상 타입 정의
 */
export type ChatNicknameColor = typeof CHAT_NICKNAME_COLORS[number];