import { ipcClient } from "./base";
import {
  ChatSearchFilters,
  ChatSearchResult,
  EventSearchFilters,
  EventSearchResult,
  IpcRequestWithPayload,
  PaginationParams,
  UserSearchFilters,
  UserSearchResult,
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
    const raw = await ipcClient(IpcRequestWithPayload.SearchEventLogs, {
      filters,
      pagination,
    });

    raw.eventLogs = raw.eventLogs.map((v) => ({
      ...v,
      payload: JSON.parse(v.payload as string),
    }));

    return raw;
  },

  async searchUserLogs(
    filters: UserSearchFilters,
    pagination: PaginationParams
  ): Promise<UserSearchResult> {
    return await ipcClient(IpcRequestWithPayload.SearchUserLogs, {
      filters,
      pagination,
    });
  },

  async getUserLogDates(userId: string, channelId: string): Promise<string[]> {
    return await ipcClient(IpcRequestWithPayload.GetUserLogDates, {
      userId,
      channelId,
    });
  },
};
