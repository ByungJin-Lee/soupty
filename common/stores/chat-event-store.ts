import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MAX_QUEUE_CAPACITY } from "~/constants/events";
import { ChatProcessor } from "~/features/chat/processors/chat-processor";
import { OtherEventProcessor } from "~/features/chat/processors/other-event-processor";
import { MessagePart } from "~/types";
import { ChatEvent, RawChatEvent } from "~/types/event";
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
    const forceUpdate = () => set({ lastUpdate: Date.now() });

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
