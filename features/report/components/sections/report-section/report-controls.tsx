import { BroadcastSession, ReportInfo, ReportStatusInfo } from "~/services/ipc/types";

type Props = {
  session: BroadcastSession;
  report: ReportInfo | null;
  reportStatus: ReportStatusInfo | null;
  reportLoading: boolean;
  onCreateReport: (broadcastId: number) => void;
  onDeleteReport: (broadcastId: number) => void;
};

export const ReportControls: React.FC<Props> = ({
  session,
  report,
  reportStatus,
  reportLoading,
  onCreateReport,
  onDeleteReport,
}) => {
  return (
    <div className="flex gap-2">
      {!report && !reportStatus && (
        <button
          onClick={() => onCreateReport(session.id)}
          disabled={reportLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reportLoading ? "생성 중..." : "리포트 생성"}
        </button>
      )}
      {report && (
        <button
          onClick={() => onDeleteReport(session.id)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          리포트 삭제
        </button>
      )}
    </div>
  );
};