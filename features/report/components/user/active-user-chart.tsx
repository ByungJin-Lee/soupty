import { ReportData } from "~/services/ipc/types";
import { UserDistributionChart } from "./user-distribution-chart";

type Props = {
  data: ReportData;
};

export const ActiveUserChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex p-6 items-center">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm mr-2">
          ⚡
        </span>
        활성 시청자
        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          채팅, 도네이션 등의 활동을 한 시청자
        </span>
      </h4>
      <UserDistributionChart
        startAt={data.metadata.startTime}
        chunks={data.chunks}
        analysis={data.userAnalysis}
      />
    </div>
  );
};
