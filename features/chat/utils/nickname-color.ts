import { CHAT_NICKNAME_COLORS } from "~/constants/chat-colors";

/**
 * 닉네임을 기반으로 일관된 색상을 반환하는 함수
 * 같은 닉네임은 항상 같은 색상을 가집니다
 */
export function getNicknameColor(nickname: string): string {
  // 닉네임의 해시값을 계산하여 색상 인덱스 결정
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    const char = nickname.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  
  // 음수 처리 및 색상 배열 인덱스로 변환
  const index = Math.abs(hash) % CHAT_NICKNAME_COLORS.length;
  return CHAT_NICKNAME_COLORS[index];
}