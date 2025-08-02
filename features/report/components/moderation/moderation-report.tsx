import { ReportData } from "~/services/ipc/types";
import { KickTrendChart } from "./kick-trend-chart";
import { MuteTrendChart } from "./mute-trend-chart";
import { UserHistoriesTable } from "./user-histories-table";

type Props = {
  data: ReportData;
};

export const ModerationReport: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white flex items-center bg-black py-1 rounded-md">
        <span className="px-3 rounded-lg text-base mr-3">💀</span>
        관리 지표
      </h3>

      <MuteTrendChart data={data} />
      <UserHistoriesTable
        title="채팅금지된 사용자"
        histories={data.moderationAnalysis.totalMuteHistories}
      />
      <KickTrendChart data={data} />
      <UserHistoriesTable
        title="강제퇴장된 사용자"
        histories={data.moderationAnalysis.totalKickHistories}
      />
    </div>
  );
};
