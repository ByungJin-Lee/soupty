"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePaginationContext } from "~/common/context/pagination";
import { Pagination } from "~/common/ui/pagination";
import { HistoryChannelCondition } from "~/features/history/components/history-channel-condition";
import { HistoryPeriodCondition } from "~/features/history/components/history-period-condition";
import { formatTimestamp } from "~/features/history/utils/format";
import { BroadcastSession } from "~/services/ipc/types";
import { useBroadcastSessionContext } from "../context/broadcast-session-context";
import {
  convertBroadcastSessionFilter,
  useBroadcastSessionFilter,
} from "../hooks/use-broadcast-session-filter";

export const BroadcastSessionList: React.FC = () => {
  const { result, loading, search } = useBroadcastSessionContext();
  const pagination = usePaginationContext();
  const { watch, setValue, getValues, reset } = useBroadcastSessionFilter();
  const router = useRouter();

  const filters = watch();

  const handleSearch = () => {
    const searchFilters = convertBroadcastSessionFilter(getValues());
    search(searchFilters, pagination);
  };

  const handleSelectSession = (session: BroadcastSession) => {
    router.push(`/broadcast/session?id=${session.id}`);
  };

  // 페이지네이션 변경 시 재검색
  useEffect(() => {
    const searchFilters = convertBroadcastSessionFilter(getValues());
    search(searchFilters, pagination);
  }, [pagination]);

  return (
    <div className="flex flex-col flex-1">
      {/* 헤더 */}
      <div className="mt-2">
        <h1 className="text-xl font-bold text-gray-900 mb-2">방송 세션</h1>
      </div>

      {/* 필터 */}
      <div className="bg-gray-50 p-3 rounded-lg mb-3 flex gap-2 flex-wrap">
        <HistoryChannelCondition
          channel={filters.channel}
          onSelect={(channel) => setValue("channel", channel)}
        />
        <HistoryPeriodCondition
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(date) => setValue("startDate", date)}
          onEndDateChange={(date) => setValue("endDate", date)}
        />
        <div className="ml-auto">
          <button
            onClick={() => reset()}
            className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            초기화
          </button>
          <button
            onClick={handleSearch}
            className="px-2 py-1 ml-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "검색 중..." : "검색"}
          </button>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="flex-1 min-h-0">
        {loading && (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            검색 중...
          </div>
        )}

        {!loading && !result && (
          <div className="p-12 text-center text-gray-500">
            검색을 시작하세요.
          </div>
        )}

        {!loading && result && result.broadcastSessions.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}

        {!loading && result && result.broadcastSessions.length > 0 && (
          <div className="space-y-2">
            {result.broadcastSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700">
                      {session.title}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="inline-flex items-center">
                        <span className="font-medium">채널:</span>
                        <span className="ml-1">{session.channelName}</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        <span className="font-medium">시작:</span>{" "}
                        {formatTimestamp(session.startedAt)}
                      </div>
                      {session.endedAt && (
                        <div>
                          <span className="font-medium">종료:</span>{" "}
                          {formatTimestamp(session.endedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    {!session.endedAt && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        진행 중
                      </span>
                    )}
                    <div className="text-xs text-gray-400 group-hover:text-blue-600">
                      클릭하여 상세보기 →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {result && result.totalPages > 1 && (
          <Pagination
            totalCount={result.totalCount}
            totalPages={result.totalPages}
          />
        )}
      </div>
    </div>
  );
};
