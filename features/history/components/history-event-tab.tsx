import { PaginationProvider } from "~/common/ui/pagination-provider";
import { HistoryEventFilter } from "./history-event-filter";
import { HistoryEventResults } from "./history-event-results";
import { HistoryEventSearchProvider } from "./history-event-search-provider";

export const HistoryEventTab = () => {
  return (
    <PaginationProvider>
      <HistoryEventSearchProvider>
        <HistoryEventFilter>
          <HistoryEventResults />
        </HistoryEventFilter>
      </HistoryEventSearchProvider>
    </PaginationProvider>
  );
};