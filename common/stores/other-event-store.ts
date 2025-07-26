import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MAX_QUEUE_CAPACITY } from "~/constants/events";
import { DomainEvent, RawDomainEvent } from "~/types";
import CircularQueue from "../utils/circular-queue";

interface OtherEventState {
  otherQueue: CircularQueue<DomainEvent>;
  lastUpdate: number;
}

interface OtherEventActions {
  handleOtherEvent(e: RawDomainEvent): void;
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
          // Other 이벤트 처리 로직
          const processed: DomainEvent = {
            id: e.payload.id,
            type: e.type,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            payload: e.payload as any,
          };
          get().otherQueue.push(processed);
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
