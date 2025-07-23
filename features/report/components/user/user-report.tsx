import { ReportData } from "~/services/ipc/types";
import { ViewerTrendChart } from "./viewer-trend-chart";
import { ActiveUserChart } from "./active-user-chart";

type Props = {
  data: ReportData;
};

export const UserReport: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-base mr-3">👥</span>
        시청자 지표
      </h3>
      
      <ViewerTrendChart data={data} />
      <ActiveUserChart data={data} />
    </div>
  );
};
