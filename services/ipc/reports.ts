import { invoke } from "@tauri-apps/api/core";
import { IpcRequestWithPayload, ReportInfo, ReportStatusInfo } from "./types";

export const createReport = async (broadcastId: number): Promise<void> => {
  return invoke(IpcRequestWithPayload.CreateReport, { broadcastId });
};

export const getReport = async (
  broadcastId: number
): Promise<ReportInfo | null> => {
  return invoke(IpcRequestWithPayload.GetReport, { broadcastId });
};

export const deleteReport = async (broadcastId: number): Promise<void> => {
  return invoke(IpcRequestWithPayload.DeleteReport, { broadcastId });
};

export const getReportStatus = async (
  broadcastId: number
): Promise<ReportStatusInfo | null> => {
  return invoke(IpcRequestWithPayload.GetReportStatus, { broadcastId });
};

// 폴링을 위한 유틸리티 함수
export const pollReportStatus = (
  broadcastId: number,
  onUpdate: (status: ReportStatusInfo) => void,
  onComplete: (report: ReportInfo) => void,
  onError: (error: string) => void,
  intervalMs = 2000
): (() => void) => {
  const interval = setInterval(async () => {
    try {
      const status = await getReportStatus(broadcastId);
      if (!status) {
        onError("리포트 상태를 찾을 수 없습니다.");
        clearInterval(interval);
        return;
      }

      onUpdate(status);

      if (status.status === "COMPLETED") {
        const report = await getReport(broadcastId);
        if (report) {
          onComplete(report);
        }
        clearInterval(interval);
      } else if (status.status === "FAILED") {
        onError(status.errorMessage || "리포트 생성에 실패했습니다.");
        clearInterval(interval);
      }
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
      clearInterval(interval);
    }
  }, intervalMs);

  // 정리 함수 반환
  return () => clearInterval(interval);
};
