import { useReportManagement } from "~/features/report/hooks";
import { Report } from "../../report";
import { ReportControls } from "./report-controls";
import { ReportStatus as ReportStatusComponent } from "./report-status";
import { ReportStatus } from "~/services/ipc/types";
import { BroadcastSession } from "~/services/ipc/types";

type Props = {
  session: BroadcastSession;
};

export const ReportSection: React.FC<Props> = ({ session }) => {
  const {
    report,
    reportStatus,
    reportLoading,
    reportError,
    handleCreateReport,
    handleDeleteReport,
  } = useReportManagement();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">분석 리포트</h2>
        <ReportControls
          session={session}
          report={report}
          reportStatus={reportStatus}
          reportLoading={reportLoading}
          onCreateReport={handleCreateReport}
          onDeleteReport={handleDeleteReport}
        />
      </div>

      <ReportStatusComponent 
        reportError={reportError}
        reportStatus={reportStatus}
      />

      {/* 완성된 리포트 */}
      {report &&
        report.status === ReportStatus.COMPLETED &&
        report.reportData && <Report data={report.reportData} />}

      {/* 리포트가 없는 경우 */}
      {!report && !reportStatus && !reportError && (
        <div className="text-gray-500 text-center py-8">
          리포트를 생성하여 방송의 상세한 분석 정보를 확인하세요.
        </div>
      )}
    </div>
  );
};