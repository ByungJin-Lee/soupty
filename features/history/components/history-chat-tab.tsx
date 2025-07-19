import { PaginationProvider } from "~/common/ui/pagination-provider";
import { HistoryChatFilter } from "./history-chat-filter";
import { HistoryChatResults } from "./history-chat-results";
import { HistoryChatSearchProvider } from "./history-chat-search-provider";

export const HistoryChatTab = () => {
  return (
    <PaginationProvider>
      {/* 채팅 검색 필터 */}
      <HistoryChatSearchProvider>
        <HistoryChatFilter>
          <HistoryChatResults />
        </HistoryChatFilter>
      </HistoryChatSearchProvider>
    </PaginationProvider>
  );
};
