import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MAX_QUEUE_CAPACITY } from "~/constants/events";
import { ChatProcessor } from "~/features/chat/processors/chat-processor";
import { OtherEventProcessor } from "~/features/chat/processors/other-event-processor";
import { ChatEvent, MessagePart, RawChatEvent } from "~/types";
import CircularQueue from "../utils/circular-queue";

type OnRemoveItems = (items: ChatEvent[]) => void;

interface ChatEventState {
  chatQueue: CircularQueue<ChatEvent>;
  lastUpdate: number;
  chatProcessor: ChatProcessor;
  otherEventProcessor: OtherEventProcessor;
  onRemoveItems: OnRemoveItems | null;
}

interface ChatEventActions {
  handleChatEvent(e: RawChatEvent): void;
  addChat(e: ChatEvent): void;
  clearChats(): void;
  updateChatProcessor(processor: {
    regex: RegExp;
    process: (text: string, regex: RegExp) => MessagePart[];
  }): void;
  setOnRemoveItems(handler: OnRemoveItems | null): void;
}

export const useChatEventStore = create<ChatEventState & ChatEventActions>()(
  subscribeWithSelector((set, get) => {
    let throttleTimer: NodeJS.Timeout | null = null;
    const removedItems: ChatEvent[] = [];
    const chatQueue = new CircularQueue<ChatEvent>(MAX_QUEUE_CAPACITY);

    const forceUpdate = () => {
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        get().onRemoveItems?.([...removedItems]);
        removedItems.length = 0;
        set({ lastUpdate: Date.now() });
        throttleTimer = null;
      }, 16); // ~60fps
    };

    return {
      chatQueue,
      lastUpdate: Date.now(),
      chatProcessor: new ChatProcessor(),
      otherEventProcessor: new OtherEventProcessor(),
      onRemoveItems: null,

      handleChatEvent(e) {
        const processedEvent = get().chatProcessor.processEvent(e);

        // other-event-store로 전달 처리
        get().otherEventProcessor.sendToOtherStore(processedEvent);

        const removedItem = get().chatQueue.push(processedEvent);
        if (removedItem) {
          // 기존 배열을 변경하여 객체 재할당 방지 (throttle 유지)
          removedItems.push(removedItem);
        }
        forceUpdate();
      },

      addChat(e) {
        const removedItem = get().chatQueue.push(e);
        if (removedItem) {
          // 기존 배열을 변경하여 객체 재할당 방지 (throttle 유지)
          removedItems.push(removedItem);
        }
        forceUpdate();
      },

      clearChats() {
        get().chatQueue.clear();
        removedItems.length = 0; // 배열 초기화 (재할당 방지)
        forceUpdate();
      },

      updateChatProcessor(processor) {
        get().chatProcessor.updateEmojiProcessor(processor);
      },

      setOnRemoveItems(handler) {
        set({
          onRemoveItems: handler,
        });
      },
    };
  })
);
