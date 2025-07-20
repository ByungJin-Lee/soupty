import { PropsWithChildren, useState } from "react";
import ipcService from "~/services/ipc";
import {
  EventSearchFilters,
  EventSearchResult,
  PaginationParams,
} from "~/services/ipc/types";
import { HistoryEventSearchContextProvider } from "../context/history-event-search-context";

export const HistoryEventSearchProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [searchResult, setSearchResult] = useState<EventSearchResult | null>(
    null
  );

  const search = async (
    filter: EventSearchFilters,
    pagination: PaginationParams
  ) => {
    const result = await ipcService.chatHistory.searchEventLogs(
      filter,
      pagination
    );
    setSearchResult(result);
  };

  return (
    <HistoryEventSearchContextProvider
      value={{
        result: searchResult,
        search,
      }}
    >
      {children}
    </HistoryEventSearchContextProvider>
  );
};