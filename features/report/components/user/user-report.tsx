import { ReportData } from "~/services/ipc/types";
import { ActiveUserChart } from "./active-user-chart";
import { ViewerTrendChart } from "./viewer-trend-chart";

type Props = {
  data: ReportData;
};

export const UserReport: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center bg-purple-200 py-1 rounded-md">
        <span className="px-3 rounded-lg text-base mr-3">👥</span>
        시청자 지표
      </h3>

      <ViewerTrendChart data={data} />
      <ActiveUserChart data={data} />
    </div>
  );
};
