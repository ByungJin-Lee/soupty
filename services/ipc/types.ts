import { DomainEventType, Emoji, OGQ, User } from "~/types";

// 요청 Payload가 없는 request 객체입니다
export enum IpcRequestWithoutPayload {
  None = "none",
  DisconnectChannel = "stop_main_controller",
  GetChannels = "get_channels",
  GetTargetUsers = "get_target_users",
  GetMainControllerContext = "get_main_controller_context",
  GetSupportedEventTypes = "get_supported_event_types",
}

// 요청 Payload가 있는 request 객체입니다.
export enum IpcRequestWithPayload {
  DeleteChannel = "delete_channel",
  UpsertChannel = "upsert_channel",
  ConnectChannel = "start_main_controller",
  AnalyzeEmotion = "analyze_chat",
  GetStreamerLive = "fetch_streamer_live",
  GetStreamerVODList = "fetch_streamer_vod_list",
  GetVODDetail = "fetch_streamer_vod_detail",
  GetStreamerStation = "fetch_streamer_station",
  GetStreamerEmoji = "fetch_streamer_emoticon",
  AddTargetUser = "add_target_user",
  RemoveTargetUser = "remove_target_user",
  SearchChatLogs = "search_chat_logs",
  SearchEventLogs = "search_event_logs",
  SearchUserLogs = "search_user_logs",
  DeleteBroadcastSession = "delete_broadcast_session",
  GetBroadcastSession = "get_broadcast_session",
  SearchBroadcastSessions = "search_broadcast_sessions",
  UpdateBroadcastSessionEndTime = "update_broadcast_session_end_time",
  UpdateBroadcastSessionVODId = "update_broadcast_vod_id",
  CreateReport = "create_report",
  DeleteReport = "delete_report",
  GetReport = "get_report",
  GetReportStatus = "get_report_status",
  ExportEventsToCsv = "export_events_to_csv",
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
  [IpcRequestWithPayload.GetStreamerVODList]: {
    streamerId: string;
    page: number;
  };
  [IpcRequestWithPayload.GetVODDetail]: {
    vodId: number;
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
  [IpcRequestWithPayload.AddTargetUser]: TargetUser;
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
  [IpcRequestWithPayload.SearchUserLogs]: {
    filters: UserSearchFilters;
    pagination: PaginationParams;
  };
  [IpcRequestWithPayload.DeleteBroadcastSession]: {
    broadcastId: number;
  };
  [IpcRequestWithPayload.GetBroadcastSession]: {
    broadcastId: number;
  };
  [IpcRequestWithPayload.SearchBroadcastSessions]: {
    filters: BroadcastSessionSearchFilters;
    pagination: PaginationParams;
  };
  [IpcRequestWithPayload.UpdateBroadcastSessionEndTime]: {
    broadcastId: number;
    endedAt: string;
  };
  [IpcRequestWithPayload.CreateReport]: {
    broadcastId: number;
  };
  [IpcRequestWithPayload.DeleteReport]: {
    broadcastId: number;
  };
  [IpcRequestWithPayload.GetReport]: {
    broadcastId: number;
  };
  [IpcRequestWithPayload.GetReportStatus]: {
    broadcastId: number;
  };
  [IpcRequestWithPayload.ExportEventsToCsv]: { options: CsvExportOptions };
  [IpcRequestWithPayload.UpdateBroadcastSessionVODId]: {
    broadcastId: number;
    vodId: number;
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
  [IpcRequestWithoutPayload.GetTargetUsers]: TargetUser[];
  [IpcRequestWithoutPayload.GetMainControllerContext]: BroadcastMetadata | null;
  [IpcRequestWithoutPayload.GetSupportedEventTypes]: string[];
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
  [IpcRequestWithPayload.SearchUserLogs]: UserSearchResult;
  [IpcRequestWithPayload.DeleteBroadcastSession]: void;
  [IpcRequestWithPayload.GetBroadcastSession]: BroadcastSession | null;
  [IpcRequestWithPayload.SearchBroadcastSessions]: BroadcastSessionSearchResult;
  [IpcRequestWithPayload.CreateReport]: void;
  [IpcRequestWithPayload.DeleteReport]: void;
  [IpcRequestWithPayload.GetReport]: ReportInfo | null;
  [IpcRequestWithPayload.GetReportStatus]: ReportStatusInfo | null;
  [IpcRequestWithPayload.ExportEventsToCsv]: string;
  [IpcRequestWithPayload.GetStreamerVODList]: StreamerVOD[] | null;
  [IpcRequestWithPayload.GetVODDetail]: VODDetail | null;
  [IpcRequestWithPayload.UpdateBroadcastSessionVODId]: void;
}

export interface StreamerVOD {
  id: number;
  title: string;
  thumbnailUrl: string;
  regDate: string;
  duration: number;
}

export interface VODDetail {
  id: string;
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
  username?: string;
}

// 이벤트 검색 관련 타입
export interface EventSearchFilters {
  channelId?: string;
  userId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  broadcastId?: number;
  username?: string;
  excludeEventTypes?: string[];
}

// 사용자 검색 관련 타입
export interface UserSearchFilters {
  userId: string;
  channelId?: string;
  sessionId?: number;
  startDate?: string;
  endDate?: string;
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

export interface UserSearchResult {
  logs: UserLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ChatLogMetadata {
  emoticon: OGQ;
}

export enum ChatLogMessageType {
  Emotion = "EMOTICON",
  Sticker = "STICKER",
  Text = "TEXT",
}

export interface ChatLogResult {
  id: number;
  broadcastId: number;
  user: User;
  messageType: ChatLogMessageType;
  message: string;
  metadata?: ChatLogMetadata;
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
  eventType: DomainEventType;
  payload: unknown;
  timestamp: string;
  channelId: string;
  channelName: string;
  broadcastTitle: string;
}

export interface UserLogEntry {
  id: number;
  broadcastId: number;
  user: User;
  logType: "CHAT" | "EVENT";
  timestamp: string;
  channelId: string;
  channelName: string;
  broadcastTitle: string;
  // 채팅 로그 필드
  messageType?: ChatLogMessageType;
  message?: string;
  metadata?: ChatLogMetadata;
  // 이벤트 로그 필드
  eventType?: DomainEventType;
  payload?: string;
}

// 방송 세션 검색 관련 타입
export interface BroadcastSessionSearchFilters {
  channelId?: string;
  startDate?: string;
  endDate?: string;
}

export interface BroadcastSessionSearchResult {
  broadcastSessions: BroadcastSession[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BroadcastSession {
  id: number;
  channelId: string;
  channelName: string;
  title: string;
  startedAt: string;
  endedAt?: string;
  /**
   * @description 0인 경우 할당되지 않은 상태입니다.
   */
  vodId: number;
}

// 리포트 관련 타입
export interface ReportInfo {
  broadcastId: number;
  status: ReportStatus;
  reportData?: ReportData;
  version: number;
  errorMessage?: string;
  progressPercentage?: number;
}

export interface ReportStatusInfo {
  broadcastId: number;
  status: ReportStatus;
  progressPercentage?: number;
  errorMessage?: string;
}

export enum ReportStatus {
  PENDING = "PENDING",
  GENERATING = "GENERATING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface ReportData {
  metadata: ReportMetadata;
  chunks: ReportChunk[];
  chatAnalysis: ChatAnalysis;
  userAnalysis: UserAnalysis;
  eventAnalysis: EventAnalysis;
  moderationAnalysis: ModerationAnalysis;
}

export interface UserAnalysis {
  unique: Matrix;
  normal: Matrix;
  subscriber: Matrix;
  fan: Matrix;
}

export interface ChatAnalysis {
  totalCount: number;
  topChatters: ChatterRank[];
  popularWords: WordCount[];
}

export interface WordCount {
  word: string;
  count: number;
}

export interface ChatterRank {
  user: User;
  messageCount: number;
}

export interface ReportMetadata {
  chunkSize: number;
  durationSeconds: number;
  startTime: string;
  endTime?: string;
}

export interface ReportChunk {
  timestamp: string;
  user: UserVital;
  chat: ChatVital;
  event: EventVital;
  moderation: ModerationVital;
  viewerCount?: number;
}

export interface Matrix {
  min: number;
  avg: number;
  total: number;
  max: number;
}

export interface ChatVital {
  popularWords: WordCount[];
  topChatters: ChatterRank[];
  totalCount: number;
}

export interface UserVital {
  fanCount: number;
  normalCount: number;
  subscriberCount: number;
  uniqueCount: number;
}

export interface EventAnalysis {
  totalDonationCount: number;
  totalDonationAmount: number;
  totalMissionDonationCount: number;
  totalMissionDonationAmount: number;
  averageDonationAmount: number;
  totalSubscribeCount: number;
  totalSubscribeRenewCount: number;
  topDonators: DonatorRank[];
}

export interface EventVital {
  donationCount: number;
  donationAmount: number;
  missionDonationCount: number;
  missionDonationAmount: number;
  subscribeCount: number;
  subscribeRenewCount: number;
}

export interface ModerationAnalysis {
  totalMuteCount: number;
  totalMuteHistories: UserHistory[];
  totalKickCount: number;
  totalKickHistories: UserHistory[];
}

export interface ModerationVital {
  muteCount: number;
  muteHistories: UserHistory[];
  kickCount: number;
  kickHistories: UserHistory[];
}

export interface UserHistory {
  by?: string;
  user: User;
  timestamp: string;
}

export interface DonatorRank {
  userId: string;
  userLabel: string;
  donationCount: number;
  totalAmount: number;
  missionAmount: number;
}

// CSV Export 관련 타입
export interface CsvExportOptions {
  eventType: string;
  startDate?: string | null;
  endDate?: string | null;
  channelId?: string | null;
  broadcastId?: number | null;
  outputPath: string;
}

export interface TargetUser {
  userId: string;
  username: string;
}

// CSV Export 옵션 검증 함수
export function validateCsvExportOptions(
  options: CsvExportOptions
): string | null {
  if (!options.broadcastId && !options.channelId) {
    return "Either broadcastId or channelId must be provided";
  }

  if (!options.eventType || options.eventType.trim() === "") {
    return "eventType is required";
  }

  if (!options.outputPath || options.outputPath.trim() === "") {
    return "outputPath is required";
  }

  return null;
}
