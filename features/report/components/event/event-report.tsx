import { ReportData } from "~/services/ipc/types";
import { DonationTrendChart } from "./donation-trend-chart";
import { SubscribeTrendChart } from "./subscribe-trend-chart";

type Props = {
  data: ReportData;
};

export const EventReport: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center bg-rose-200 py-1 rounded-md">
        <span className="px-3 rounded-lg text-base mr-3">🎊</span>
        이벤트 지표
      </h3>

      <DonationTrendChart data={data} />
      <SubscribeTrendChart data={data} />
    </div>
  );
};
