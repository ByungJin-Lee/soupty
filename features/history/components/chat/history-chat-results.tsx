import { Pagination } from "~/common/ui/pagination";
import { useHistoryChatFilterCtx } from "../../context/history-chat-filter-context";
import { useHistoryChatSearchContext } from "../../context/history-chat-search-context";
import { HistoryChatItem } from "./history-chat-item";

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
        <div className="chat-log-table-grid sticky top-0 bg-gray-100 border-b border-gray-300 text-sm font-medium text-gray-700 text-center">
          <div>이름</div>
          <div>시각</div>
          <div>내용</div>
          <div>채널</div>
          <div>세션</div>
        </div>
        <div className="chat-log-table-grid">
          {result.chatLogs.map((chatLog) => (
            <HistoryChatItem key={chatLog.id} chatLog={chatLog} />
          ))}
        </div>
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
