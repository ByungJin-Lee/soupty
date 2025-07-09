export enum StatsType {
  ActiveViewer = "ActiveViewer",
  LOL = "LOL",
  ChatPerMinute = "ChatPerMinute",
  WordCount = "WordCount",
  ActiveChatterRanking = "ActiveChatterRanking",
}

export interface BaseStats {
  timestamp: string;
}
