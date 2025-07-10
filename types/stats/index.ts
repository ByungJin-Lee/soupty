import {
  ActiveChatterRankingItem,
  ActiveChatterRankingStats,
} from "./active-chatter-ranking";
import { ActiveViewerStats } from "./active-viewer";
import { StatsType } from "./base";
import { CPMStats } from "./cpm";
import { LOLStats } from "./lol";
import { WordCountItem, WordCountStats } from "./word-count";

export * from "./base";

type _StatsMap<T, P> = {
  type: T;
  payload: P;
};

export type Stats =
  | _StatsMap<StatsType.ActiveViewer, ActiveViewerStats>
  | _StatsMap<StatsType.LOL, LOLStats>
  | _StatsMap<StatsType.ChatPerMinute, CPMStats>
  | _StatsMap<StatsType.WordCount, WordCountStats>
  | _StatsMap<StatsType.ActiveChatterRanking, ActiveChatterRankingStats>;

export type {
  ActiveChatterRankingItem,
  ActiveChatterRankingStats,
  ActiveViewerStats,
  CPMStats,
  LOLStats,
  WordCountItem,
  WordCountStats,
};
