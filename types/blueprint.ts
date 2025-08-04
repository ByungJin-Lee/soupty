import { StatsType } from "./stats";

export interface Blueprint {
  columns: BlueprintColumn[];
}

export type BlueprintColumn =
  | WithoutComponent<BlueprintColumnType.ChatViewer>
  | WithoutComponent<BlueprintColumnType.EventViewer>
  | WithComponent<BlueprintColumnType.StatsViewer, StatsType[]>
  | WithoutComponent<BlueprintColumnType.Blank>;

export interface WithComponent<T, C> {
  type: T;
  components: C;
}

export interface WithoutComponent<T> {
  type: T;
}

export enum BlueprintColumnType {
  ChatViewer = "chat-viewer",
  EventViewer = "event-viewer",
  StatsViewer = "stats-viewer",
  Blank = "blank",
}
