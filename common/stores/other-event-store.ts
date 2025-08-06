import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MAX_QUEUE_CAPACITY } from "~/constants/events";
import { DomainEvent } from "~/types";
import CircularQueue from "../utils/circular-queue";

interface OtherEventState {
  otherQueue: CircularQueue<DomainEvent>;
  lastUpdate: number;
}

interface OtherEventActions {
  handleOtherEvent(e: DomainEvent): void;
  addEvent(event: DomainEvent): void;
  clearOthers(): void;
}

export const useOtherEventStore = create<OtherEventState & OtherEventActions>()(
  subscribeWithSelector((set, get) => {
    const forceUpdate = () => set({ lastUpdate: Date.now() });

    return {
      otherQueue: new CircularQueue<DomainEvent>(MAX_QUEUE_CAPACITY),
      lastUpdate: Date.now(),

      handleOtherEvent(e) {
        try {
          get().otherQueue.push(e);
          forceUpdate();
        } catch (err) {
          console.error(e, err);
        }
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
