import { useCallback, useState } from "react";
import {
  createReport,
  deleteReport,
  getReport,
  getReportStatus,
  pollReportStatus,
} from "~/services/ipc/reports";
import {
  ReportInfo,
  ReportStatus,
  ReportStatusInfo,
} from "~/services/ipc/types";

export const useReportManagement = () => {
  const [report, setReport] = useState<ReportInfo | null>(null);
  const [reportStatus, setReportStatus] = useState<ReportStatusInfo | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // 리포트 정보 로드
  const loadReportInfo = useCallback(async (broadcastId: number) => {
    try {
      const reportInfo = await getReport(broadcastId);
      setReport(reportInfo);

      // 리포트가 진행 중인 경우 상태도 확인
      if (
        reportInfo &&
        (reportInfo.status === ReportStatus.PENDING ||
          reportInfo.status === ReportStatus.GENERATING)
      ) {
        const status = await getReportStatus(broadcastId);
        setReportStatus(status);

        // 진행 중인 경우 폴링 시작
        if (
          status &&
          (status.status === ReportStatus.PENDING ||
            status.status === ReportStatus.GENERATING)
        ) {
          startReportPolling(broadcastId);
        }
      }
    } catch (err) {
      console.error("Failed to load report info:", err);
    }
  }, []);

  // 리포트 생성
  const handleCreateReport = async (broadcastId: number) => {
    try {
      setReportLoading(true);
      setReportError(null);

      await createReport(broadcastId);
      console.log("Report creation started for session:", broadcastId);

      // 생성 시작 후 상태 폴링 시작
      startReportPolling(broadcastId);
    } catch (err) {
      setReportError("리포트 생성에 실패했습니다.");
      console.error("Failed to create report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  // 리포트 삭제
  const handleDeleteReport = async (broadcastId: number) => {
    try {
      await deleteReport(broadcastId);
      setReport(null);
      setReportStatus(null);
      setReportError(null);
      console.log("Report deleted for session:", broadcastId);
    } catch (err) {
      setReportError("리포트 삭제에 실패했습니다.");
      console.error("Failed to delete report:", err);
    }
  };

  // 리포트 상태 폴링
  const startReportPolling = (broadcastId: number) => {
    const cleanup = pollReportStatus(
      broadcastId,
      (status) => {
        setReportStatus(status);
      },
      (completedReport) => {
        setReport(completedReport);
        setReportStatus(null);
      },
      (error) => {
        setReportError(error);
        setReportStatus(null);
      }
    );

    return cleanup;
  };

  return {
    report,
    reportStatus,
    reportLoading,
    reportError,
    loadReportInfo,
    handleCreateReport,
    handleDeleteReport,
  };
};