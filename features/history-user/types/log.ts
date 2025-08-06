import { SimplifiedUserLogEntry } from "~/services/ipc/types";

export interface LogBlock {
  date: string;
  logs: SimplifiedUserLogEntry[];
}
