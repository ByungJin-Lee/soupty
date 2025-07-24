import { StatsType } from "~/types/stats";
import { StatsDescriptions } from "../constants";
import { ActiveChatterRankChart } from "./active-chatter-rank-chart";
import { ActiveViewerChart } from "./active-viewer-chart";
import { CPMChart } from "./cpm-chart";
import { LOLChart } from "./lol-chart";
import { SentimentChart } from "./sentiment-chart";
import { WordCloud } from "./word-cloud";

type Props = {
  type: StatsType | "none";
};

export const StatsRow: React.FC<Props> = ({ type }) => {
  if (type === "none") {
    return (
      <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600 font-medium">No Stats Selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transition-shadow duration-300 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 py-1">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-md">
            {StatsDescriptions[type]?.text}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-indigo-200 text-xs bg-indigo-600/30 px-2 py-1 rounded">
              2.5s
            </span>
            <div
              className="text-indigo-200 hover:text-white cursor-help transition-colors"
              title={`${StatsDescriptions[type]?.description} (${StatsDescriptions[type]?.dataRange})`}
            >
              ℹ️
            </div>
          </div>
        </div>
      </div>
      <div className="p-1">
        <StatsContent type={type} />
      </div>
    </div>
  );
};

const StatsContent = ({ type }: { type: StatsType }) => {
  switch (type) {
    case StatsType.WordCount:
      return <WordCloud />;
    case StatsType.LOL:
      return <LOLChart />;
    case StatsType.ActiveViewer:
      return <ActiveViewerChart />;
    case StatsType.ActiveChatterRanking:
      return <ActiveChatterRankChart />;
    case StatsType.ChatPerMinute:
      return <CPMChart />;
    case StatsType.Sentiment:
      return <SentimentChart />;
    default:
      return <div>Unknown Stats Type</div>;
  }
};
