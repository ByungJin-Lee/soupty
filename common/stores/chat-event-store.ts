import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MAX_QUEUE_CAPACITY } from "~/constants/events";
import { ChatProcessor } from "~/features/chat/processors/chat-processor";
import { MessagePart } from "~/types";
import { ChatEvent, RawChatEvent } from "~/types/event";
import CircularQueue from "../utils/circular-queue";

interface ChatEventState {
  chatQueue: CircularQueue<ChatEvent>;
  lastUpdate: number;
  chatProcessor: ChatProcessor;
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

      handleChatEvent(e) {
        const processedEvent = get().chatProcessor.processEvent(e);
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
