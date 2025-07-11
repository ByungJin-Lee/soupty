import { StatsType } from "~/types/stats";
import { StatsDescriptions } from "../constants";
import { ActiveViewerChart } from "./active-viewer-chart";
import { CPMChart } from "./cpm-chart";
import { LOLChart } from "./lol-chart";
import { WordCloud } from "./word-cloud";

type Props = {
  type: StatsType | "none";
};

export const StatsRow: React.FC<Props> = ({ type }) => {
  if (type === "none") {
    return <div className="h-full w-full bg-gray-200">No Stats Selected</div>;
  }

  return (
    <div>
      <p>{StatsDescriptions[type]?.text}</p>
      <StatsContent type={type} />
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
      return <ActiveViewerChart />;
    case StatsType.ChatPerMinute:
      return <CPMChart />;
    default:
      return <div>Unknown Stats Type</div>;
  }
};
