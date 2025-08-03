import { PropsWithChildren, useState } from "react";
import ipcService from "~/services/ipc";
import {
  ChatSearchFilters,
  ChatSearchResult,
  PaginationParams,
} from "~/services/ipc/types";
import { HistoryChatSearchContextProvider } from "../../context/history-chat-search-context";

export const HistoryChatSearchProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [searchResult, setSearchResult] = useState<ChatSearchResult | null>(
    null
  );

  const search = async (
    filter: ChatSearchFilters,
    pagination: PaginationParams
  ) => {
    const result = await ipcService.chatHistory.searchChatLogs(
      filter,
      pagination
    );
    setSearchResult(result);
  };

  return (
    <HistoryChatSearchContextProvider
      value={{
        result: searchResult,
        search,
      }}
    >
      {children}
    </HistoryChatSearchContextProvider>
  );
};
