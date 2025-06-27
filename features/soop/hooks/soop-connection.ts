import {
  mergeWithDefault,
  transformStreamerEmojis,
} from "~/features/emoji/converter";
import { useEmoji } from "~/features/emoji/stores/emoji";
import ipcService from "~/services/ipc";
import { StreamerLive } from "~/services/ipc/types";
import { Channel } from "~/types";
import { useChannel } from "../stores/channel";
import { makeBroadcastState } from "../utils";

/**
 * @description Connection를 관리합니다.
 */
export const useSOOPConnection = (channel: Channel) => {
  const updateEmoji = useEmoji((s) => s.update);
  const chl = useChannel();

  /**
   * @description 연결 관련 Template 메소드
   */
  const connect = async () => {
    // 방송 중인지 확인
    const streamerLive = await ipcService.soop.getStreamerLive(channel.id);
    validateStreamerLive(streamerLive);
    // 방송 중이라면 관련 데이터를 가져옵니다.
    // - 방송국 정보, 이모지 정보
    const [station, emojis] = await Promise.all([
      ipcService.soop.getStreamerStation(channel.id),
      ipcService.soop.getStreamerEmoji(channel.id),
    ]);
    // 이모지 업데이트
    updateEmoji(mergeWithDefault(transformStreamerEmojis(channel.id, emojis)));
    // 채널 업데이트
    chl.setChannel(channel);
    chl.setBroadcast(makeBroadcastState(streamerLive!, station));
    // 채널 연결
    await ipcService.channel.connectChannel(channel.id);
  };

  const disconnect = async () => {
    await ipcService.channel.disconnectChannel();
    chl.reset();
  };

  return {
    connect,
    disconnect,
  };
};

const validateStreamerLive = (streamerLive: StreamerLive | null) => {
  if (!streamerLive || !streamerLive.is_live) {
    throw Error("방송 중이 아닙니다. 연결할 수 없습니다.");
  }
};
