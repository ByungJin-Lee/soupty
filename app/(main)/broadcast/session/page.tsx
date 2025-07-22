"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatTimestamp } from "~/features/history/utils/format";
import { ReportLineChart } from "~/features/report/components/report-line-chart";
import { UserDistributionChart } from "~/features/report/components/user-distribution-chart";
import { getBroadcastSessionDetail } from "~/services/ipc/broadcast-session";
import {
  createReport,
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

  console.log(report);

  return (
    <div className="p-6 max-w-4xl mx-auto flex-1 overflow-y-scroll invisible-scrollbar">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
          {!session.endedAt && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              진행 중
            </span>
          )}
        </div>
        <div className="text-gray-600">
          <span className="font-medium">채널:</span> {session.channelName}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">세션 ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">
              {session.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">채널명</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {session.channelName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">시작 시간</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatTimestamp(session.startedAt)}
            </dd>
          </div>
          {session.endedAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">종료 시간</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatTimestamp(session.endedAt)}
              </dd>
            </div>
          )}
        </div>
      </div>

      {/* 리포트 섹션 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">분석 리포트</h2>
          {!report && !reportStatus && (
            <button
              onClick={handleCreateReport}
              disabled={reportLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportLoading ? "생성 중..." : "리포트 생성"}
            </button>
          )}
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
          report.reportData && (
            <div className="space-y-6">
              {/* 요약 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">
                    총 채팅 수
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {report.reportData.chatAnalysis.totalCount}
                  </dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">
                    총 이벤트 수
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    0
                  </dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">
                    참여 사용자
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    0
                  </dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">
                    방송 시간
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {Math.floor(
                      report.reportData.metadata.durationSeconds / 3600
                    )}
                    시간
                  </dd>
                </div>
              </div>

              <ReportLineChart
                startAt={report.reportData.metadata.startTime}
                chunks={report.reportData.chunks}
                getter={(v) => v.chat.totalCount}
              />

              <ReportLineChart
                startAt={report.reportData.metadata.startTime}
                chunks={report.reportData.chunks}
                getter={(v) => v.viewerCount || 0}
                color="red"
              />

              <UserDistributionChart
                startAt={report.reportData.metadata.startTime}
                chunks={report.reportData.chunks}
              />

              {/* 이벤트 분석 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    도네이션 분석
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 도네이션:</span>
                      <span className="font-medium">0 원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">도네이션 횟수:</span>
                      <span className="font-medium">0 회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">구독자 수:</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    사용자 활동
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">입장 사용자:</span>
                      <span className="font-medium">0 명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">퇴장 사용자:</span>
                      <span className="font-medium">0 명</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 상위 채터 */}
              {/* {report.reportData.chatAnalysis.topChatters.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    상위 채팅 사용자
                  </h3>
                  <div className="space-y-2">
                    {report.reportData.chatAnalysis.topChatters
                      .slice(0, 5)
                      .map((chatter, index) => (
                        <div
                          key={chatter.userId}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center">
                            <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-3">
                              {index + 1}
                            </span>
                            <span className="font-medium">
                              {chatter.username}
                            </span>
                          </div>
                          <span className="text-gray-600">
                            {chatter.messageCount.toLocaleString()}회
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )} */}
            </div>
          )}

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
