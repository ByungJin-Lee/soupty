import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  ActiveChatterRankingStats,
  ActiveViewerStats,
  SentimentStats,
  Stats,
  StatsType,
  WordCountStats,
} from "~/types/stats";
import CircularQueue from "../utils/circular-queue";

type NumericValue = {
  timeLabel: string;
  count: number;
};

interface StatsEventState {
  activeViewers: StatsDatasource<ActiveViewerStats>;
  lol: StatsDatasource<CircularQueue<NumericValue>>;
  cpm: StatsDatasource<CircularQueue<NumericValue>>;
  activeChatterRanking: StatsDatasource<ActiveChatterRankingStats>;
  wordCount: StatsDatasource<WordCountStats>;
  sentiment: StatsDatasource<SentimentStats>;
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
      activeChatterRanking: {
        data: {
          rankings: [],
          timestamp: "",
        },
        lastUpdated: now,
      },
      wordCount: {
        data: {
          words: [],
          timestamp: "",
        },
        lastUpdated: now,
      },
      sentiment: {
        data: {
          positiveCount: 0,
          negativeCount: 0,
          neutralCount: 0,
          totalCount: 0,
          positiveRatio: 0,
          negativeRatio: 0,
          neutralRatio: 0,
          averageScore: 0,
          timestamp: "",
        },
        lastUpdated: now,
      },
      handleStatsEvent(e) {
        switch (e.type) {
          case StatsType.LOL:
            get().lol.data.push({
              timeLabel: formatTimestamp(e.payload.timestamp),
              count: e.payload.count,
            });
            forceUpdate("lol");
            break;
          case StatsType.ActiveViewer:
            update("activeViewers", e.payload);
            break;
          case StatsType.ChatPerMinute:
            get().cpm.data.push({
              timeLabel: formatTimestamp(e.payload.timestamp),
              count: e.payload.count,
            });
            forceUpdate("cpm");
            break;
          case StatsType.WordCount:
            update("wordCount", e.payload);
            break;
          case StatsType.ActiveChatterRanking:
            update("activeChatterRanking", e.payload);
            break;
          case StatsType.Sentiment:
            update("sentiment", e.payload);
            break;
          default:
          // console.log(e);
        }
      },
      clearStats() {},
    };
  })
);

const formatTimestamp = (timestamp: string) => {
  const t = new Date(timestamp);
  return `${t.getMinutes()}:${t.getSeconds()}`;
};
