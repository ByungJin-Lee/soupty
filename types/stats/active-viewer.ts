import { BaseStats } from "./base";

export interface ActiveViewerStats extends BaseStats {
  total: number;
  fan: number;
  subscriber: number;
  normal: number;
}
