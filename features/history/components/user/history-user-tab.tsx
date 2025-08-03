import { PaginationProvider } from "~/common/ui/pagination-provider";
import { HistoryUserFilter } from "./history-user-filter";
import { HistoryUserResults } from "./history-user-results";
import { HistoryUserSearchProvider } from "./history-user-search-provider";

export const HistoryUserTab = () => {
  return (
    <PaginationProvider>
      {/* 사용자 검색 필터 */}
      <HistoryUserSearchProvider>
        <HistoryUserFilter>
          <HistoryUserResults />
        </HistoryUserFilter>
      </HistoryUserSearchProvider>
    </PaginationProvider>
  );
};
