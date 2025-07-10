import { BaseStats } from "./base";

export interface ActiveChatterRankingItem {
  userId: string;
  nickname: string;
  chatCount: number;
}

export interface ActiveChatterRankingStats extends BaseStats {
  rankings: ActiveChatterRankingItem[];
}
