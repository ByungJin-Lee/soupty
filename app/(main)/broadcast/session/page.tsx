"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BroadcastSessionHeader } from "~/features/report/components/broadcast-session-header";
import { Report } from "~/features/report/components/report";
import { getBroadcastSessionDetail } from "~/services/ipc/broadcast-session";
import {
  createReport,
  deleteReport,
  getReport,
  getReportStatus,
  pollReportStatus,
} from "~/services/ipc/reports";
import {
  BroadcastSession,
  ReportInfo,
  ReportStatus,
  ReportStatusInfo,
} from "~/services/ipc/types";

export default function BroadcastSessionDetailPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const [session, setSession] = useState<BroadcastSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 리포트 관련 상태
  const [report, setReport] = useState<ReportInfo | null>(null);
  const [reportStatus, setReportStatus] = useState<ReportStatusInfo | null>(
    null
  );
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionDetail = async () => {
      if (!sessionId) {
        setError("세션 ID가 제공되지 않았습니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const sessionDetail = await getBroadcastSessionDetail(sessionId);
        setSession(sessionDetail);

        // 세션 정보를 가져온 후 리포트 정보도 확인
        if (sessionDetail) {
          await loadReportInfo(sessionDetail.id);
        }
      } catch (err) {
        setError("세션 정보를 불러오는데 실패했습니다.");
        console.error("Failed to load session detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSessionDetail();
  }, [sessionId]);

  // 리포트 정보 로드
  const loadReportInfo = async (broadcastId: number) => {
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
  };

  // 리포트 생성
  const handleCreateReport = async () => {
    if (!session) return;

    try {
      setReportLoading(true);
      setReportError(null);

      await createReport(session.id);
      console.log("Report creation started for session:", session.id);

      // 생성 시작 후 상태 폴링 시작
      startReportPolling(session.id);
    } catch (err) {
      setReportError("리포트 생성에 실패했습니다.");
      console.error("Failed to create report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  // 리포트 삭제
  const handleDeleteReport = async () => {
    if (!session || !report) return;

    try {
      await deleteReport(session.id);
      setReport(null);
      setReportStatus(null);
      setReportError(null);
      console.log("Report deleted for session:", session.id);
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

    // 컴포넌트 언마운트 시 폴링 정리
    return cleanup;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600">세션 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-2">오류 발생</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-600">세션을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 max-w-4xl mx-auto flex-1 overflow-y-scroll invisible-scrollbar">
      <BroadcastSessionHeader session={session} />

      {/* 리포트 섹션 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">분석 리포트</h2>
          <div className="flex gap-2">
            {!report && !reportStatus && (
              <button
                onClick={handleCreateReport}
                disabled={reportLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reportLoading ? "생성 중..." : "리포트 생성"}
              </button>
            )}
            {report && (
              <button
                onClick={handleDeleteReport}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                리포트 삭제
              </button>
            )}
          </div>
        </div>

        {/* 리포트 에러 */}
        {reportError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-700 text-sm">{reportError}</div>
          </div>
        )}

        {/* 리포트 상태 (진행 중) */}
        {reportStatus &&
          (reportStatus.status === ReportStatus.PENDING ||
            reportStatus.status === ReportStatus.GENERATING) && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center mb-2">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                <span className="text-blue-700 font-medium">
                  {reportStatus.status === ReportStatus.PENDING
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
                  {reportStatus.progressPercentage.toFixed(1)}% 완료
                </div>
              )}
            </div>
          )}

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
    </div>
  );
}
