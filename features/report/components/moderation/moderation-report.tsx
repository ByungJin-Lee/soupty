import { ReportData } from "~/services/ipc/types";
import { MuteTrendChart } from "./mute-trend-chart";

type Props = {
  data: ReportData;
};

export const ModerationReport: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-base mr-3">
          💀
        </span>
        관리 지표
      </h3>

      <MuteTrendChart data={data} />
    </div>
  );
};
