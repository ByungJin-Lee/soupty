import { ReportData } from "~/services/ipc/types";
import { ChatReport } from "./chat/chat-report";
import { ReportSummary } from "./report-summary";
import { UserReport } from "./user/user-report";

type Props = {
  data: ReportData;
};

export const Report: React.FC<Props> = ({ data }) => {
  console.log(data);
  return (
    <div className="space-y-6">
      <ReportSummary data={data} />

      <UserReport data={data} />

      <ChatReport data={data} />
    </div>
  );
};
