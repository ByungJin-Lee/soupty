import { ReportData } from "~/services/ipc/types";
import { ReportLineChart } from "../report-line-chart";

type Props = {
  data: ReportData;
};

export const ViewerTrendChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl  shadow-sm">
      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex p-6 items-center">
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm mr-2">
          📈
        </span>
        시청자 추이
      </h4>
      <ReportLineChart
        startAt={data.metadata.startTime}
        chunks={data.chunks}
        getter={(v) => v.viewerCount || 0}
        color="red"
        hideSum
      />
    </div>
  );
};
