import { ipcClient } from "./base";
import { IpcRequestWithPayload } from "./types";

/**
 * @description Streamer의 현재 Live 정보를 불러옵니다.
 */
const getStreamerLive = (streamerId: string) => {
  return ipcClient(IpcRequestWithPayload.GetStreamerLive, {
    streamerId,
  });
};

/**
 * @description Streamer의 현재 Station 정보를 불러옵니다.
 */
const getStreamerStation = (streamerId: string) => {
  return ipcClient(IpcRequestWithPayload.GetStreamerStation, {
    streamerId,
  });
};

/**
 * @description Streamer의 현재 Emoticon 정보를 불러옵니다.
 */
const getStreamerEmoji = async (streamerId: string) => {
  const resp = await ipcClient(IpcRequestWithPayload.GetStreamerEmoji, {
    streamerId,
  });

  return [...resp.tier1, ...resp.tier2];
};

/**
 * @description soop ipc 관리 객체
 */
export const soop = Object.freeze({
  getStreamerLive,
  getStreamerEmoji,
  getStreamerStation,
});
