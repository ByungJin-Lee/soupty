import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MAX_QUEUE_CAPACITY } from "~/constants/events";
import CircularQueue from "../utils/circular-queue";

interface StatsEventState {
  statsQueue: CircularQueue<unknown>;
  lastUpdate: number;
}

interface StatsEventActions {
  handleStatsEvent(e: unknown): void;
  addEvent(event: unknown): void;
  clearStats(): void;
}

export const useStatsEventStore = create<StatsEventState & StatsEventActions>()(
  subscribeWithSelector((set, get) => {
    const forceUpdate = () => set({ lastUpdate: Date.now() });

    return {
      statsQueue: new CircularQueue<unknown>(MAX_QUEUE_CAPACITY),
      lastUpdate: Date.now(),

      handleStatsEvent(e) {
        get().statsQueue.push(e);
        console.log(e);
        forceUpdate();
      },

      addEvent(event) {
        get().statsQueue.push(event);
        forceUpdate();
      },

      clearStats() {
        get().statsQueue.clear();
        forceUpdate();
      },
    };
  })
);
