import { StatsType } from "~/types/stats";

interface Description {
  text: string;
  cycle: number;
}

export const StatsDescriptions: Record<StatsType, Description> = {
  [StatsType.WordCount]: {
    text: "자주 사용되는 단어 통계",
    cycle: 1,
  },
  [StatsType.LOL]: {
    text: "웃음 통계",
    cycle: 1,
  },
  [StatsType.ActiveViewer]: {
    text: "활동적인 시청자 통계",
    cycle: 1,
  },
  [StatsType.ActiveChatterRanking]: {
    text: "채팅 참여자 순위",
    cycle: 1,
  },
  [StatsType.ChatPerMinute]: {
    text: "분당 채팅 수",
    cycle: 1,
  },
};
