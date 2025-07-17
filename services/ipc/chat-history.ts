import { ipcClient } from "./base";
import {
  ChatSearchFilters,
  ChatSearchResult,
  EventSearchFilters,
  EventSearchResult,
  IpcRequestWithPayload,
  PaginationParams,
} from "./types";

export const chatHistoryService = {
  async searchChatLogs(
    filters: ChatSearchFilters,
    pagination: PaginationParams
  ): Promise<ChatSearchResult> {
    return await ipcClient(IpcRequestWithPayload.SearchChatLogs, {
      filters,
      pagination,
    });
  },
  
  async searchEventLogs(
    filters: EventSearchFilters,
    pagination: PaginationParams
  ): Promise<EventSearchResult> {
    return await ipcClient(IpcRequestWithPayload.SearchEventLogs, {
      filters,
      pagination,
    });
  },
};
