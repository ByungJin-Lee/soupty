import { ReportData } from "~/services/ipc/types";
import { ReportLineChart } from "../report-line-chart";

type Props = {
  data: ReportData;
};

export const KickTrendChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl  shadow-sm">
      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex p-6 items-center">
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm mr-2">
          💀
        </span>
        강제퇴장 추이
        {/* <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
       
        </span> */}
      </h4>
      <ReportLineChart
        startAt={data.metadata.startTime}
        chunks={data.chunks}
        getter={(v) => v.moderation.kickCount}
        color="red"
      />
    </div>
  );
};
