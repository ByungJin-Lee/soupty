"use client";

import { useEffect } from "react";
import { usePaginationContext } from "~/common/context/pagination";
import { Modal } from "~/common/ui/modal";
import { PaginationProvider } from "~/common/ui/pagination-provider";
import { ChannelCondition, PeriodCondition } from "~/features/condition";
import { formatTimestamp } from "~/features/history/utils/format";
import { BroadcastSession } from "~/services/ipc/types";
import { useBroadcastSessionSearchContext } from "../context/broadcast-session-search-context";
import {
  convertBroadcastSessionFilter,
  useBroadcastSessionFilter,
} from "../hooks/use-broadcast-session-filter";
import { BroadcastSessionSearchProvider } from "./broadcast-session-search-provider";

interface BroadcastSessionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession?: (session: BroadcastSession) => void;
}

const BroadcastSessionContent: React.FC<{
  onSelectSession?: (session: BroadcastSession) => void;
  onClose: () => void;
}> = ({ onSelectSession, onClose }) => {
  const { result, loading, search } = useBroadcastSessionSearchContext();
  const pagination = usePaginationContext();
  const { watch, setValue, getValues } = useBroadcastSessionFilter();

  const filters = watch();

  const handleSearch = () => {
    const searchFilters = convertBroadcastSessionFilter(getValues());
    search(searchFilters, pagination);
  };

  const handleSelectSession = (session: BroadcastSession) => {
    onSelectSession?.(session);
    onClose();
  };

  // 초기 검색
  useEffect(() => {
    handleSearch();
  }, []);

  // 페이지네이션 변경 시 재검색
  useEffect(() => {
    const searchFilters = convertBroadcastSessionFilter(getValues());
    search(searchFilters, pagination);
  }, [pagination.page, pagination.pageSize]);

  return (
    <div className="w-[400px] max-h-[600px] flex flex-col">
      {/* 필터 헤더 */}
      <div className="bg-gray-50 p-3 rounded-lg flex gap-2 mb-3">
        <ChannelCondition
          channel={filters.channel}
          onSelect={(channel) => setValue("channel", channel)}
        />
        <PeriodCondition
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(date) => setValue("startDate", date)}
          onEndDateChange={(date) => setValue("endDate", date)}
        />

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 ml-auto text-white rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>

      {/* 결과 목록 */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-8 text-center text-gray-500">검색 중...</div>
        )}

        {!loading && !result && (
          <div className="p-8 text-center text-gray-500">
            검색을 시작하세요.
          </div>
        )}

        {!loading && result && result.broadcastSessions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}

        {!loading && result && result.broadcastSessions.length > 0 && (
          <div className="space-y-2">
            {result.broadcastSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {session.title}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      채널: {session.channelName}
                    </div>
                    <div className="text-xs text-gray-500">
                      시작: {formatTimestamp(session.startedAt)}
                      {session.endedAt && (
                        <span className="ml-2">
                          종료: {formatTimestamp(session.endedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {!session.endedAt && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        진행 중
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {result && result.totalPages > 1 && (
        <div className="mt-4 p-3 border-t">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() =>
                pagination.setPage(Math.max(1, pagination.page - 1))
              }
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              이전
            </button>
            <span className="px-3 py-1 text-sm">
              {pagination.page} / {result.totalPages}
            </span>
            <button
              onClick={() =>
                pagination.setPage(
                  Math.min(result.totalPages, pagination.page + 1)
                )
              }
              disabled={pagination.page === result.totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const BroadcastSessionSelectorModal: React.FC<
  BroadcastSessionSelectorModalProps
> = ({ isOpen, onClose, onSelectSession }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="방송 세션 선택">
      <PaginationProvider>
        <BroadcastSessionSearchProvider>
          <BroadcastSessionContent
            onSelectSession={onSelectSession}
            onClose={onClose}
          />
        </BroadcastSessionSearchProvider>
      </PaginationProvider>
    </Modal>
  );
};
