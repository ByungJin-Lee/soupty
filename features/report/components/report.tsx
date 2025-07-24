import { ReportData } from "~/services/ipc/types";
import { ChatReport } from "./chat/chat-report";
import { EventReport } from "./event";
import { ModerationReport } from "./moderation";
import { ReportSummary } from "./report-summary";
import { UserReport } from "./user/user-report";

type Props = {
  data: ReportData;
};

export const Report: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <ReportSummary data={data} />
      <UserReport data={data} />
      <ChatReport data={data} />
      <EventReport data={data} />
      <ModerationReport data={data} />
    </div>
  );
};
