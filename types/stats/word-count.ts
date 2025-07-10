import { BaseStats } from "./base";

export interface WordCountItem {
  word: string;
  count: number;
}

export interface WordCountStats extends BaseStats {
  words: WordCountItem[];
}
