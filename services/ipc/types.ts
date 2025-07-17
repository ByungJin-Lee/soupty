import { Emoji } from "~/types";

// 요청 Payload가 없는 request 객체입니다
export enum IpcRequestWithoutPayload {
  None = "none",
  DisconnectChannel = "stop_main_controller",
  GetChannels = "get_channels",
  GetTargetUsers = "get_target_users",
  GetMainControllerContext = "get_main_controller_context",
}

// 요청 Payload가 있는 request 객체입니다.
export enum IpcRequestWithPayload {
  DeleteChannel = "delete_channel",
  UpsertChannel = "upsert_channel",
  ConnectChannel = "start_main_controller",
  AnalyzeEmotion = "analyze_chat",
  GetStreamerLive = "fetch_streamer_live",
  GetStreamerStation = "fetch_streamer_station",
  GetStreamerEmoji = "fetch_streamer_emoticon",
  AddTargetUser = "add_target_user",
  RemoveTargetUser = "remove_target_user",
  SearchChatLogs = "search_chat_logs",
  SearchEventLogs = "search_event_logs",
}

export type IpcRequest = IpcRequestWithPayload | IpcRequestWithoutPayload;

/**
 * @description Payload가 있는 경우, Payload를 연결합니다.
 */
export interface IpcPayloadMap {
  [IpcRequestWithPayload.AnalyzeEmotion]: {
    text: string;
  };
  [IpcRequestWithPayload.GetStreamerLive]: {
    streamerId: string;
  };
  [IpcRequestWithPayload.GetStreamerEmoji]: {
    streamerId: string;
  };
  [IpcRequestWithPayload.GetStreamerStation]: {
    streamerId: string;
  };
  [IpcRequestWithPayload.ConnectChannel]: {
    channelId: string;
  };
  [IpcRequestWithPayload.UpsertChannel]: {
    channelId: string;
    channelName: string;
  };
  [IpcRequestWithPayload.DeleteChannel]: {
    channelId: string;
  };
  [IpcRequestWithPayload.AddTargetUser]: {
    userId: string;
  };
  [IpcRequestWithPayload.RemoveTargetUser]: {
    userId: string;
  };
  [IpcRequestWithPayload.SearchChatLogs]: {
    filters: ChatSearchFilters;
    pagination: PaginationParams;
  };
  [IpcRequestWithPayload.SearchEventLogs]: {
    filters: EventSearchFilters;
    pagination: PaginationParams;
  };
}

/**
 * @description 각 request에 해당하는 결과 객체입니다.
 */
export interface IpcResponseMap {
  [IpcRequestWithoutPayload.None]: unknown;
  [IpcRequestWithoutPayload.DisconnectChannel]: void;
  [IpcRequestWithoutPayload.GetChannels]: {
    channelId: string;
    channelName: string;
    lastUpdated: number;
  }[];
  [IpcRequestWithoutPayload.GetTargetUsers]: string[];
  [IpcRequestWithoutPayload.GetMainControllerContext]: BroadcastMetadata | null;
  /// 라이브가 아닌 경우 null이 반환됩니다.
  [IpcRequestWithPayload.GetStreamerLive]: StreamerLive | null;
  [IpcRequestWithPayload.GetStreamerEmoji]: StreamerEmoji;
  [IpcRequestWithPayload.GetStreamerStation]: StreamerStation;
  [IpcRequestWithPayload.AnalyzeEmotion]: unknown;
  [IpcRequestWithPayload.ConnectChannel]: void;
  [IpcRequestWithPayload.DeleteChannel]: void;
  [IpcRequestWithPayload.UpsertChannel]: void;
  [IpcRequestWithPayload.AddTargetUser]: void;
  [IpcRequestWithPayload.RemoveTargetUser]: void;
  [IpcRequestWithPayload.SearchChatLogs]: ChatSearchResult;
  [IpcRequestWithPayload.SearchEventLogs]: EventSearchResult;
}

export interface StreamerLive {
  categories: string[];
  isLive: boolean;
  streamerNick: string;
  title: string;
}

export interface StreamerStation {
  broad_start: string;
  isPassword: boolean;
  viewerCount: number;
  title: string;
}

export interface StreamerEmoji {
  tier1: Emoji[];
  tier2: Emoji[];
}

export interface BroadcastMetadata {
  channelId: string;
  title: string;
  startedAt: string;
  viewerCount: number;
  timestamp: string;
}

// 채팅 검색 관련 타입
export interface ChatSearchFilters {
  channelId?: string;
  userId?: string;
  messageContains?: string;
  messageType?: string;
  startDate?: string;
  endDate?: string;
  broadcastId?: number;
}

// 이벤트 검색 관련 타입
export interface EventSearchFilters {
  channelId?: string;
  userId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  broadcastId?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ChatSearchResult {
  chatLogs: ChatLogResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EventSearchResult {
  eventLogs: EventLogResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ChatLogResult {
  id: number;
  broadcastId: number;
  userId: string;
  username: string;
  messageType: string;
  message: string;
  metadata?: string;
  timestamp: string;
  channelId: string;
  channelName: string;
  broadcastTitle: string;
}

export interface EventLogResult {
  id: number;
  broadcastId: number;
  userId?: string;
  username?: string;
  eventType: string;
  payload: string;
  timestamp: string;
  channelId: string;
  channelName: string;
  broadcastTitle: string;
}
