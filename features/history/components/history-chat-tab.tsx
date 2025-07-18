import { HistoryChatFilter } from "./history-chat-filter";

export const HistoryChatTab = () => {
  return (
    <>
      {/* 채팅 검색 필터 */}
      <HistoryChatFilter />

      {/* 채팅 결과 표시 */}
      {/* {chatResults && (
        <div className="flex-1">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              총 {chatResults.totalCount}개 결과 (페이지 {chatResults.page}/
              {chatResults.totalPages})
            </p>

            <div className="flex items-center gap-2">
              <label className="text-sm">페이지 크기:</label>
              <select
                value={chatPagination.pageSize}
                onChange={(e) =>
                  setChatPagination({
                    ...chatPagination,
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
            {chatResults.chatLogs.map((log: ChatLogResult) => (
              <div key={log.id} className="bg-white p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.username}</span>
                    <span className="text-sm text-gray-500">
                      ({log.userId})
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {log.messageType}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                <p className="text-gray-800 mb-2">{log.message}</p>
                <div className="text-xs text-gray-500">
                  <span>
                    채널: {log.channelName} ({log.channelId})
                  </span>
                  <span className="ml-4">방송: {log.broadcastTitle}</span>
                </div>
              </div>
            ))}

            {chatResults.chatLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>

          {/* 채팅 페이지네이션 */}
      {/* {chatResults.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => handleChatPageChange(chatResults.page - 1)}
                disabled={chatResults.page === 1 || chatLoading}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                이전
              </button>

              {[...Array(Math.min(5, chatResults.totalPages))].map((_, i) => {
                const pageNum = Math.max(1, chatResults.page - 2) + i;
                if (pageNum > chatResults.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handleChatPageChange(pageNum)}
                    disabled={chatLoading}
                    className={`px-3 py-1 rounded ${
                      pageNum === chatResults.page
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handleChatPageChange(chatResults.page + 1)}
                disabled={
                  chatResults.page === chatResults.totalPages || chatLoading
                }
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )} 
        </div>
      )} */}
    </>
  );
};
