import { create } from "zustand";
import { Channel } from "~/types";

type LiveChannelState = {
  /**
   * @description 현재 연결할 채널입니다
   */
  channel: Channel | null;
  /**
   * @description 채널의 연결 상태입니다.
   */
  connected: boolean;
};

export const useLiveChannel = create<LiveChannelState>(() => ({
  channel: null,
  connected: false,
}));
