import { User } from "../soop";
import { BaseStats } from "./base";

export interface ActiveChatterRankingItem {
  user: User;
  chatCount: number;
}

export interface ActiveChatterRankingStats extends BaseStats {
  rankings: ActiveChatterRankingItem[];
}
