import { create } from "zustand";
import { Channel } from "~/types";

export interface BroadcastState {
  title: string;
  isPassword: boolean;
  start: string;
  viewerCount: number;
  categories: string[];
}

interface ChannelState {
  channel: Channel | null;
  broadcast: BroadcastState | null;
  setChannel(channel: Channel): void;
  setBroadcast(broadcast: Partial<BroadcastState>): void;
  reset(): void;
}

/**
 * @description 현재 접속중인 채널에 관한 정보를 관리합니다.
 */
export const useChannel = create<ChannelState>((set) => ({
  channel: null,
  broadcast: null,
  setChannel(channel) {
    set({
      channel,
    });
  },
  setBroadcast(broadcast) {
    set((state) => ({
      broadcast: {
        ...(state.broadcast ?? {
          title: "",
          isPassword: false,
          start: "",
          viewerCount: 0,
          categories: [],
        }),
        ...broadcast,
      },
    }));
  },
  reset() {
    set({
      channel: null,
      broadcast: null,
    });
  },
}));
