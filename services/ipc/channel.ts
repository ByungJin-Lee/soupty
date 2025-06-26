import { ipcClient } from "./base";
import { IpcRequestWithoutPayload, IpcRequestWithPayload } from "./types";

/**
 * @description Channel을 생성하여 연결합니다.
 */
const connectChannel = (channelId: string) => {
  return ipcClient(IpcRequestWithPayload.ConnectChannel, {
    channelId,
  });
};

/**
 * @description Channel을 닫습니다.
 */
const disconnectChannel = () => {
  return ipcClient(IpcRequestWithoutPayload.DisconnectChannel);
};

export const channel = Object.freeze({
  connectChannel,
  disconnectChannel,
});
