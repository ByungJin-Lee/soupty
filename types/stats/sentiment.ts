import { BaseStats } from "./base";

export interface SentimentStats extends BaseStats {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalCount: number;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  averageScore: number;
}