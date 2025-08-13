import { ReportData } from "~/services/ipc/types";
import { ReportLabelContextProvider } from "../context/report-label-context";
import { useReportLabel } from "../hooks/report-label";
import { ChatReport } from "./chat/chat-report";
import { EventReport } from "./event";
import { ModerationReport } from "./moderation";
import { ReportLabelToggle } from "./report-label-toggle";
import { ReportSummary } from "./report-summary";
import { UserReport } from "./user/user-report";

type Props = {
  data: ReportData;
};

export const Report: React.FC<Props> = ({ data }) => {
  const reportLabel = useReportLabel();

  return (
    <ReportLabelContextProvider value={reportLabel}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p>프로그램 동작 시점에 따라 수집된 데이터의 차이가 있습니다.</p>
          <ReportLabelToggle />
        </div>
        <ReportSummary data={data} />
        <UserReport data={data} />
        <ChatReport data={data} />
        <EventReport data={data} />
        <ModerationReport data={data} />
      </div>
    </ReportLabelContextProvider>
  );
};
