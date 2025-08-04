import { HistoryType } from "./tab";

export interface HistoryOpenerOption {
  type?: HistoryType;
  sessionId?: number;
  channelId?: string;
  userId?: string;
}
