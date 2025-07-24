import { StatsType } from "~/types/stats";

interface Description {
  text: string;
  description: string;
  dataRange: string;
  cycle: number;
}

const CYCLE_DURATION_S = 2.5;
export const CHART_HEIGHT = 280;

export const StatsDescriptions: Record<StatsType, Description> = {
  [StatsType.WordCount]: {
    text: "자주 사용되는 단어 통계",
    description:
      "채팅에서 자주 언급되는 단어들을 시각화하여 방송 내용의 주요 키워드를 파악할 수 있습니다.",
    dataRange: "최근 30초",
    cycle: 1,
  },
  [StatsType.LOL]: {
    text: "웃음 통계",
    description:
      "ㅋㅋㅋ 웃음 표현의 빈도를 추적하여 방송의 재미 요소를 측정합니다.",
    dataRange: "최근 10초",
    cycle: 1,
  },
  [StatsType.ActiveViewer]: {
    text: "활동적인 시청자 통계",
    description:
      "구독자, 팬, 일반 시청자별 활동 비율을 보여주어 시청자 구성을 파악할 수 있습니다.",
    dataRange: "최근 2분",
    cycle: 1,
  },
  [StatsType.ActiveChatterRanking]: {
    text: "채팅 참여자 순위",
    description: "가장 활발하게 채팅에 참여하는 시청자들의 순위를 보여줍니다.",
    dataRange: "최근 2분",
    cycle: 1,
  },
  [StatsType.ChatPerMinute]: {
    text: "분당 채팅 수",
    description: `매 ${CYCLE_DURATION_S}초마다 측정되는 채팅 빈도로 방송의 열기와 시청자 참여도를 실시간으로 확인할 수 있습니다.`,
    dataRange: "최근 1분",
    cycle: 1,
  },
  [StatsType.Sentiment]: {
    text: "감정 분석",
    description: "AI가 분석한 채팅의 감정 상태를 실시간으로 보여줍니다. 긍정, 중립, 부정 비율과 평균 감정 점수를 확인할 수 있습니다.",
    dataRange: "최근 15초",
    cycle: 1,
  },
};
