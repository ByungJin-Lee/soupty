"use client";

import { useState } from "react";
import { HistoryChatTab } from "~/features/history/components/history-chat-tab";
import { HistoryTabSelector } from "~/features/history/components/history-tab-selector";
import { ipcService } from "~/services/ipc";
import type {
  EventLogResult,
  EventSearchFilters,
  EventSearchResult,
  PaginationParams,
} from "~/services/ipc/types";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "event">("chat");

  // Event search states
  const [eventFilters, setEventFilters] = useState<EventSearchFilters>({});
  const [eventPagination, setEventPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 20,
  });
  const [eventResults, setEventResults] = useState<EventSearchResult | null>(
    null
  );
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  const handleEventSearch = async () => {
    setEventLoading(true);
    setEventError(null);

    try {
      const result = await ipcService.chatHistory.searchEventLogs(
        eventFilters,
        eventPagination
      );
      setEventResults(result);
    } catch (err) {
      setEventError(
        err instanceof Error ? err.message : "검색 중 오류가 발생했습니다"
      );
    } finally {
      setEventLoading(false);
    }
  };

  const handleEventPageChange = async (newPage: number) => {
    const newPagination = { ...eventPagination, page: newPage };
    setEventPagination(newPagination);

    setEventLoading(true);
    try {
      const result = await ipcService.chatHistory.searchEventLogs(
        eventFilters,
        newPagination
      );
      setEventResults(result);
    } catch (err) {
      setEventError(
        err instanceof Error
          ? err.message
          : "페이지 로드 중 오류가 발생했습니다"
      );
    } finally {
      setEventLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("ko-KR");
  };

  return (
    <div className="p-2 flex flex-col flex-1 overflow-y-scroll invisible-scrollbar">
      {/* 탭 네비게이션 */}
      <HistoryTabSelector currentTab={activeTab} onChange={setActiveTab} />

      {/* 채팅 검색 탭 */}
      {activeTab === "chat" && <HistoryChatTab />}

      {/* 이벤트 검색 탭 */}
      {activeTab === "event" && (
        <>
          {/* 이벤트 검색 필터 */}
          <div className="bg-gray-50 p-3 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  채널 ID
                </label>
                <input
                  type="text"
                  value={eventFilters.channelId || ""}
                  onChange={(e) =>
                    setEventFilters({
                      ...eventFilters,
                      channelId: e.target.value || undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="채널 ID 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  사용자 ID
                </label>
                <input
                  type="text"
                  value={eventFilters.userId || ""}
                  onChange={(e) =>
                    setEventFilters({
                      ...eventFilters,
                      userId: e.target.value || undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="사용자 ID 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  이벤트 타입
                </label>
                <select
                  value={eventFilters.eventType || ""}
                  onChange={(e) =>
                    setEventFilters({
                      ...eventFilters,
                      eventType: e.target.value || undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">전체</option>
                  <option value="DONATION">후원</option>
                  <option value="SUBSCRIBE">구독</option>
                  <option value="ENTER">입장</option>
                  <option value="EXIT">퇴장</option>
                  <option value="KICK">킥</option>
                  <option value="MUTE">뮤트</option>
                  <option value="BLACK">블랙</option>
                  <option value="FREEZE">프리즈</option>
                  <option value="NOTIFICATION">알림</option>
                  <option value="MISSION_DONATION">미션 후원</option>
                  <option value="SLOW">슬로우</option>
                  <option value="METADATA_UPDATE">메타데이터 업데이트</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  방송 ID
                </label>
                <input
                  type="number"
                  value={eventFilters.broadcastId || ""}
                  onChange={(e) =>
                    setEventFilters({
                      ...eventFilters,
                      broadcastId: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="방송 ID 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  시작 날짜
                </label>
                <input
                  type="datetime-local"
                  value={eventFilters.startDate || ""}
                  onChange={(e) =>
                    setEventFilters({
                      ...eventFilters,
                      startDate: e.target.value || undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  종료 날짜
                </label>
                <input
                  type="datetime-local"
                  value={eventFilters.endDate || ""}
                  onChange={(e) =>
                    setEventFilters({
                      ...eventFilters,
                      endDate: e.target.value || undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={handleEventSearch}
                disabled={eventLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {eventLoading ? "검색 중..." : "검색"}
              </button>

              <button
                onClick={() => {
                  setEventFilters({});
                  setEventResults(null);
                  setEventError(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                초기화
              </button>
            </div>
          </div>

          {/* 이벤트 오류 표시 */}
          {eventError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {eventError}
            </div>
          )}

          {/* 이벤트 결과 표시 */}
          {eventResults && (
            <div className="flex-1">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  총 {eventResults.totalCount}개 결과 (페이지{" "}
                  {eventResults.page}/{eventResults.totalPages})
                </p>

                <div className="flex items-center gap-2">
                  <label className="text-sm">페이지 크기:</label>
                  <select
                    value={eventPagination.pageSize}
                    onChange={(e) =>
                      setEventPagination({
                        ...eventPagination,
                        pageSize: parseInt(e.target.value),
                      })
                    }
                    className="p-1 border rounded"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {eventResults.eventLogs.map((log: EventLogResult) => (
                  <div
                    key={log.id}
                    className="bg-gray-50 p-3 rounded-lg border"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {log.username && (
                          <>
                            <span className="font-medium">{log.username}</span>
                            <span className="text-sm text-gray-500">
                              ({log.userId})
                            </span>
                          </>
                        )}
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {log.eventType}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-2">{log.payload}</p>
                    <div className="text-xs text-gray-500">
                      <span>
                        채널: {log.channelName} ({log.channelId})
                      </span>
                      <span className="ml-4">방송: {log.broadcastTitle}</span>
                    </div>
                  </div>
                ))}

                {eventResults.eventLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>

              {/* 이벤트 페이지네이션 */}
              {eventResults.totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleEventPageChange(eventResults.page - 1)}
                    disabled={eventResults.page === 1 || eventLoading}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    이전
                  </button>

                  {[...Array(Math.min(5, eventResults.totalPages))].map(
                    (_, i) => {
                      const pageNum = Math.max(1, eventResults.page - 2) + i;
                      if (pageNum > eventResults.totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleEventPageChange(pageNum)}
                          disabled={eventLoading}
                          className={`px-3 py-1 rounded ${
                            pageNum === eventResults.page
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handleEventPageChange(eventResults.page + 1)}
                    disabled={
                      eventResults.page === eventResults.totalPages ||
                      eventLoading
                    }
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
