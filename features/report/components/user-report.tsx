import { ReportData } from "~/services/ipc/types";
import { ReportLineChart } from "./report-line-chart";
import { UserDistributionChart } from "./user-distribution-chart";

type Props = {
  data: ReportData;
};

export const UserReport: React.FC<Props> = ({ data }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold">시청자 지표</h3>
      <h3 className="">시청자 추이</h3>
      <ReportLineChart
        startAt={data.metadata.startTime}
        chunks={data.chunks}
        getter={(v) => v.viewerCount || 0}
        color="red"
      />
      <h3 className="mt-2">
        활성 시청자<sub>(채팅, 도네이션 등의 활동을 한 시청자)</sub>
      </h3>
      <UserDistributionChart
        startAt={data.metadata.startTime}
        chunks={data.chunks}
        analysis={data.userAnalysis}
      />
    </div>
  );
};
