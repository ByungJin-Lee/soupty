import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ActiveViewerStats, Stats, StatsType } from "~/types/stats";
import CircularQueue from "../utils/circular-queue";

type NumericValue = {
  timeLabel: string;
  count: number;
};

interface StatsEventState {
  activeViewers: StatsDatasource<ActiveViewerStats>;
  lol: StatsDatasource<CircularQueue<NumericValue>>;
  cpm: StatsDatasource<CircularQueue<NumericValue>>;
}

interface StatsDatasource<T> {
  data: T;
  lastUpdated: number;
}

interface StatsEventActions {
  handleStatsEvent(e: Stats): void;
  clearStats(): void;
}

export const useStatsEventStore = create<StatsEventState & StatsEventActions>()(
  subscribeWithSelector((set, get) => {
    const forceUpdate = <K extends keyof StatsEventState>(k: K) =>
      set((p) => {
        return {
          [k]: {
            data: p[k].data,
            lastUpdated: Date.now(),
          },
        };
      });

    const update = <K extends keyof StatsEventState>(
      k: K,
      d: StatsEventState[K]["data"]
    ) =>
      set({
        [k]: {
          data: d,
          lastUpdated: Date.now(),
        },
      });

    const now = Date.now();

    // process

    return {
      activeViewers: {
        data: {
          total: 0,
          subscriber: 0,
          fan: 0,
          normal: 0,
          timestamp: "",
        },
        lastUpdated: now,
      },
      lol: {
        data: new CircularQueue<NumericValue>(100),
        lastUpdated: now,
      },
      cpm: {
        data: new CircularQueue<NumericValue>(100),
        lastUpdated: now,
      },
      handleStatsEvent(e) {
        switch (e.type) {
          case StatsType.LOL:
            const t = new Date(e.payload.timestamp);
            get().lol.data.push({
              timeLabel: `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`,
              count: e.payload.count,
            });
            forceUpdate("lol");
            break;
          case StatsType.ActiveViewer:
            update("activeViewers", e.payload);
            break;
          case StatsType.ChatPerMinute: {
            const t = new Date(e.payload.timestamp);
            get().cpm.data.push({
              timeLabel: `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`,
              count: e.payload.count,
            });
            forceUpdate("cpm");
          }
        }
      },
      clearStats() {},
    };
  })
);
