import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MAX_QUEUE_CAPACITY } from "~/constants/events";
import { ChatProcessor } from "~/features/chat/processors/chat-processor";
import { OtherEventProcessor } from "~/features/chat/processors/other-event-processor";
import { ChatEvent, MessagePart, RawChatEvent } from "~/types";
import CircularQueue from "../utils/circular-queue";

interface ChatEventState {
  chatQueue: CircularQueue<ChatEvent>;
  lastUpdate: number;
  chatProcessor: ChatProcessor;
  otherEventProcessor: OtherEventProcessor;
}

interface ChatEventActions {
  handleChatEvent(e: RawChatEvent): void;
  addChat(e: ChatEvent): void;
  clearChats(): void;
  updateChatProcessor(processor: {
    regex: RegExp;
    process: (text: string, regex: RegExp) => MessagePart[];
  }): void;
}

export const useChatEventStore = create<ChatEventState & ChatEventActions>()(
  subscribeWithSelector((set, get) => {
    let throttleTimer: NodeJS.Timeout | null = null;
    const forceUpdate = () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        set({ lastUpdate: Date.now() });
        throttleTimer = null;
      }, 16); // ~60fps
    };

    return {
      chatQueue: new CircularQueue<ChatEvent>(MAX_QUEUE_CAPACITY),
      lastUpdate: Date.now(),
      chatProcessor: new ChatProcessor(),
      otherEventProcessor: new OtherEventProcessor(),

      handleChatEvent(e) {
        const processedEvent = get().chatProcessor.processEvent(e);

        // other-event-store로 전달 처리
        get().otherEventProcessor.sendToOtherStore(processedEvent);

        get().chatQueue.push(processedEvent);
        forceUpdate();
      },

      addChat(e) {
        get().chatQueue.push(e);
        forceUpdate();
      },

      clearChats() {
        get().chatQueue.clear();
        forceUpdate();
      },

      updateChatProcessor(processor) {
        get().chatProcessor.updateEmojiProcessor(processor);
      },
    };
  })
);
