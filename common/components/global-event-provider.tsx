"use client";

import { useEffect } from "react";
import { useEventManagerStore } from "~/common/stores/event-manager-store";
import { useEmojiChatIntegration } from "../hooks/emoji-chat-integration";

/**
 * 전역 이벤트 시스템을 초기화하고 관리하는 Provider
 * 페이지 이동과 무관하게 계속해서 이벤트를 수신합니다
 */
export function GlobalEventProvider() {
  const { startListening, stopListening, isListening } = useEventManagerStore();

  // Emoji와 Chat 통합 관리
  useEmojiChatIntegration();

  useEffect(() => {
    if (!isListening) {
      console.log("🚀 이벤트 시스템 초기화 중...");
      startListening();
      console.log("✅ 이벤트 시스템 시작됨");
    }

    // 앱 종료 시 정리
    return () => {
      console.log("🔄 이벤트 시스템 정리 중...");
      stopListening();
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  return null;
}
