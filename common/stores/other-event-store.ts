import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MAX_QUEUE_CAPACITY } from "~/constants/events";
import CircularQueue from "../utils/circular-queue";

interface OtherEventState {
  otherQueue: CircularQueue<Event>;
  lastOtherUpdate: number;
}

interface OtherEventActions {
  handleOtherEvent(e: unknown): void;
  addEvent(event: Event): void;
  clearOthers(): void;
}

export const useOtherEventStore = create<OtherEventState & OtherEventActions>()(
  subscribeWithSelector((set, get) => {
    const forceUpdate = () => set({ lastOtherUpdate: Date.now() });

    return {
      otherQueue: new CircularQueue<Event>(MAX_QUEUE_CAPACITY),
      lastOtherUpdate: Date.now(),
      
      handleOtherEvent(e) {
        // Other 이벤트 처리 로직
        console.log("Other event received:", e);
        forceUpdate();
      },
      
      addEvent(event) {
        get().otherQueue.push(event);
        forceUpdate();
      },
      
      clearOthers() {
        get().otherQueue.clear();
        forceUpdate();
      },
    };
  })
);