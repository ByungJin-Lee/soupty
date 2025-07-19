import { Pagination } from "~/common/ui/pagination";
import { ChatLogResult } from "~/services/ipc/types";
import { useHistoryChatFilterCtx } from "../context/history-chat-filter-context";
import { useHistoryChatSearchContext } from "../context/history-chat-search-context";
import { formatTimestamp } from "../utils/format";
import { HistoryChatContent } from "./history-chat-content";
import { HistoryChatMessageTypeLabel } from "./history-chat-message-type-label";

type Props = {
  chatLog: ChatLogResult;
};

const ChatLogItem: React.FC<Props> = ({ chatLog }) => {
  return (
    <div className="border-b border-gray-200 p-2 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-blue-600">
              {chatLog.user.label}
            </span>
            <span className="text-sm text-gray-500">{chatLog.channelName}</span>
            <span className="text-xs text-gray-400">
              {formatTimestamp(chatLog.timestamp)}
            </span>
          </div>
          <HistoryChatContent chatLog={chatLog} />
          <div className="text-xs text-gray-600">
            방송: {chatLog.broadcastTitle}
          </div>
        </div>
        <HistoryChatMessageTypeLabel
          messageType={chatLog.messageType}
          className="text-xs text-gray-400 ml-4"
        />
      </div>
    </div>
  );
};

export const HistoryChatResults: React.FC = () => {
  const { result, search } = useHistoryChatSearchContext();
  const filters = useHistoryChatFilterCtx();

  const handlePageChange = (page: number, pageSize: number) => {
    if (filters) {
      search(filters, { page, pageSize });
    }
  };

  if (!result) {
    return (
      <div className="p-8 text-center text-gray-500">
        검색 결과를 보려면 검색을 시작하세요.
      </div>
    );
  }

  if (result.chatLogs.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">검색 결과가 없습니다.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {result.chatLogs.map((chatLog) => (
          <ChatLogItem key={chatLog.id} chatLog={chatLog} />
        ))}
      </div>
      <Pagination
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageChange}
      />
    </div>
  );
};
