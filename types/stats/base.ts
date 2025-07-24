export enum StatsType {
  ActiveViewer = "ActiveViewer",
  LOL = "LOL",
  ChatPerMinute = "ChatPerMinute",
  WordCount = "WordCount",
  ActiveChatterRanking = "ActiveChatterRanking",
  Sentiment = "Sentiment",
}

export interface BaseStats {
  timestamp: string;
}
