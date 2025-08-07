import { Channel } from "~/types";
import { ipcClient } from "./base";
import { IpcRequestWithoutPayload, IpcRequestWithPayload } from "./types";

/**
 * @description Channel을 생성하여 연결합니다. (password 생략 가능)
 */
const connectChannel = (channelId: string, password = "") => {
  return ipcClient(IpcRequestWithPayload.ConnectChannel, {
    channelId,
    password,
  });
};

/**
 * @description Channel을 닫습니다.
 */
const disconnectChannel = () => {
  return ipcClient(IpcRequestWithoutPayload.DisconnectChannel);
};

const upsertChannel = (channel: Channel) => {
  return ipcClient(IpcRequestWithPayload.UpsertChannel, {
    channelId: channel.id,
    channelName: channel.label,
  });
};

const deleteChannel = (channelId: string) => {
  return ipcClient(IpcRequestWithPayload.DeleteChannel, {
    channelId,
  });
};

const getChannels = async () => {
  const chls = await ipcClient(IpcRequestWithoutPayload.GetChannels);
  return chls.map((v) => ({
    id: v.channelId,
    label: v.channelName,
  })) as Channel[];
};

const getMainControllerContext = () => {
  return ipcClient(IpcRequestWithoutPayload.GetMainControllerContext);
};

export const channel = Object.freeze({
  connectChannel,
  disconnectChannel,
  upsertChannel,
  deleteChannel,
  getChannels,
  getMainControllerContext,
});
