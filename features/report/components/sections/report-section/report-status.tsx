import { ReportStatus as ReportStatusEnum, ReportStatusInfo } from "~/services/ipc/types";

type Props = {
  reportError: string | null;
  reportStatus: ReportStatusInfo | null;
};

export const ReportStatus: React.FC<Props> = ({ reportError, reportStatus }) => {
  return (
    <>
      {/* 리포트 에러 */}
      {reportError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-700 text-sm">{reportError}</div>
        </div>
      )}

      {/* 리포트 상태 (진행 중) */}
      {reportStatus &&
        (reportStatus.status === ReportStatusEnum.PENDING ||
          reportStatus.status === ReportStatusEnum.GENERATING) && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center mb-2">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
              <span className="text-blue-700 font-medium">
                {reportStatus.status === ReportStatusEnum.PENDING
                  ? "리포트 생성 대기 중..."
                  : "리포트 생성 중..."}
              </span>
            </div>
            {reportStatus.progressPercentage !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${reportStatus.progressPercentage}%` }}
                ></div>
              </div>
            )}
            {reportStatus.progressPercentage !== undefined && (
              <div className="text-sm text-blue-600 mt-1">
                {reportStatus.progressPercentage?.toFixed(1)}% 완료
              </div>
            )}
          </div>
        )}
    </>
  );
};