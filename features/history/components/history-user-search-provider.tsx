import { PropsWithChildren, useState } from "react";
import ipcService from "~/services/ipc";
import {
  PaginationParams,
  UserSearchFilters,
  UserSearchResult,
} from "~/services/ipc/types";
import { HistoryUserSearchContextProvider } from "../context/history-user-search-context";

export const HistoryUserSearchProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(
    null
  );

  const search = async (
    filter: UserSearchFilters,
    pagination: PaginationParams
  ) => {
    const result = await ipcService.chatHistory.searchUserLogs(
      filter,
      pagination
    );
    setSearchResult(result);
  };

  return (
    <HistoryUserSearchContextProvider
      value={{
        result: searchResult,
        search,
      }}
    >
      {children}
    </HistoryUserSearchContextProvider>
  );
};