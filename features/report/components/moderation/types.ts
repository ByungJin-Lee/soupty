import { User } from "~/types";

export interface MuteLog {
  user: User;
  logs: { timestamp: string; by?: string }[];
}
