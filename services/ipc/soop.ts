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
 * @description 스트리머의 최근 다시보기를 가져옵니다(권한이 있는 다시보기는 무시됩니다.)
 */
const getStreamerVODList = async (streamerId: string, page: number) => {
  const resp = await ipcClient(IpcRequestWithPayload.GetStreamerVODList, {
    streamerId,
    page,
  });
  return resp;
};

const getVODDetail = async (vodId: number) => {
  const resp = await ipcClient(IpcRequestWithPayload.GetVODDetail, {
    vodId,
  });
  return resp;
};

/**
 * @description soop ipc 관리 객체
 */
export const soop = Object.freeze({
  getStreamerLive,
  getStreamerEmoji,
  getStreamerStation,
  getStreamerVODList,
  getVODDetail,
});
