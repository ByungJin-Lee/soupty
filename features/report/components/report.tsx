import { ReportData } from "~/services/ipc/types";
import { ReportLineChart } from "./report-line-chart";
import { ReportSummary } from "./report-summary";
import { UserReport } from "./user-report";

type Props = {
  data: ReportData;
};

export const Report: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <ReportSummary data={data} />

      <UserReport data={data} />

      <ReportLineChart
        startAt={data.metadata.startTime}
        chunks={data.chunks}
        getter={(v) => v.chat.totalCount}
      />
    </div>
  );
};
