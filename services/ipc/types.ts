import { Emoticon } from "~/types";

// 요청 Payload가 없는 request 객체입니다
export enum IpcRequestWithoutPayload {
  None = "none",
}

// 요청 Payload가 있는 request 객체입니다.
export enum IpcRequestWithPayload {
  AnalyzeEmotion = "analyze_chat",
  GetStreamerLive = "fetch_streamer_live",
  GetStreamerStation = "fetch_streamer_station",
  GetStreamerEmoticon = "fetch_streamer_emoticon",
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
  [IpcRequestWithPayload.GetStreamerEmoticon]: {
    streamerId: string;
  };
  [IpcRequestWithPayload.GetStreamerStation]: {
    streamerId: string;
  };
}

/**
 * @description 각 request에 해당하는 결과 객체입니다.
 */
export interface IpcResponseMap {
  [IpcRequestWithoutPayload.None]: unknown;
  /// 라이브가 아닌 경우 null이 반환됩니다.
  [IpcRequestWithPayload.GetStreamerLive]: StreamerLive | null;
  [IpcRequestWithPayload.GetStreamerEmoticon]: StreamerEmoticon;
  [IpcRequestWithPayload.GetStreamerStation]: StreamerStation;
  [IpcRequestWithPayload.AnalyzeEmotion]: unknown;
}

export interface StreamerLive {
  categories: string[];
  is_live: boolean;
  streamer_nick: string;
  title: string;
}

export interface StreamerStation {
  broad_start: string;
  is_password: boolean;
  viewer_count: number;
  title: string;
}

export interface StreamerEmoticon {
  tier1: Emoticon[];
  tier2: Emoticon[];
}
