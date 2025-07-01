import { Emoji } from "~/types";

// 요청 Payload가 없는 request 객체입니다
export enum IpcRequestWithoutPayload {
  None = "none",
  DisconnectChannel = "stop_main_controller",
  GetChannels = "get_channels",
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
  /// 라이브가 아닌 경우 null이 반환됩니다.
  [IpcRequestWithPayload.GetStreamerLive]: StreamerLive | null;
  [IpcRequestWithPayload.GetStreamerEmoji]: StreamerEmoji;
  [IpcRequestWithPayload.GetStreamerStation]: StreamerStation;
  [IpcRequestWithPayload.AnalyzeEmotion]: unknown;
  [IpcRequestWithPayload.ConnectChannel]: void;
  [IpcRequestWithPayload.DeleteChannel]: void;
  [IpcRequestWithPayload.UpsertChannel]: void;
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
