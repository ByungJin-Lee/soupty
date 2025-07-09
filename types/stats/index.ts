import { ActiveViewerStats } from "./active-viewer";
import { StatsType } from "./base";
import { CPMStats } from "./cpm";
import { LOLStats } from "./lol";

export * from "./base";

type _StatsMap<T, P> = {
  type: T;
  payload: P;
};

export type Stats =
  | _StatsMap<StatsType.ActiveViewer, ActiveViewerStats>
  | _StatsMap<StatsType.LOL, LOLStats>
  | _StatsMap<StatsType.ChatPerMinute, CPMStats>;

export type { ActiveViewerStats, CPMStats, LOLStats };
