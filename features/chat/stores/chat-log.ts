import { create } from "zustand";
import { ChatEvent } from "~/types/event";

interface ChatLogState {
  chats: ChatEvent[];
  push(chat: ChatEvent): void;
}

const MAX_CHAT_LOG_LIMIT = 500;

export const useChatLog = create<ChatLogState>((set) => ({
  chats: [],
  push(chat) {
    set(({ chats }) => {
      // 초과 여부를 미리 판단합니다.
      const exceed = chats.length === MAX_CHAT_LOG_LIMIT;
      // 초과 여부에 따라 새로 내용을 만듭니다.
      const appended = chats.slice(exceed ? 1 : 0).concat(chat);
      return {
        chats: appended,
      };
    });
  },
}));
