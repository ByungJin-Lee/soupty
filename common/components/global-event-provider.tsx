"use client";

import { useEffect } from "react";
import { useEventManagerStore } from "~/common/stores/event-manager-store";
import { useChannel } from "~/features/soop/stores/channel";
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
    const initializeApp = async () => {
      if (!isListening) {
        console.log("🚀 이벤트 시스템 초기화 중...");
        startListening();
        console.log("✅ 이벤트 시스템 시작됨");

        // 채널 상태 복원
        console.log("🔄 채널 상태 복원 중...");
        const channelStore = useChannel.getState();
        await channelStore.restoreFromMainController();
        console.log("✅ 채널 상태 복원 완료");
      }
    };

    initializeApp();

    // 앱 종료 시 정리
    return () => {
      console.log("🔄 이벤트 시스템 정리 중...");
      stopListening();
    };
  }, []);

  return null;
}
