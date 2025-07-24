import { ReportData } from "~/services/ipc/types";
import { ReportLineChart } from "../report-line-chart";

type Props = {
  data: ReportData;
};

export const DonationTrendChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl  shadow-sm">
      <h4 className="text-lg font-semibold mb-4 text-gray-800 p-6 flex items-center">
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm mr-2">
          📀
        </span>
        도네이션 추이
        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          도네이션 수(미션 풍 포함, 별풍선 갯수가 아님)
        </span>
      </h4>
      <ReportLineChart
        startAt={data.metadata.startTime}
        chunks={data.chunks}
        getter={(v) => v.event.donationCount}
        color="red"
      />
    </div>
  );
};
