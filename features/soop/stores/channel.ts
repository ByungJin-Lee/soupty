import { create } from "zustand";
import { mergeWithDefault } from "~/features/emoji";
import { useEmoji } from "~/features/emoji/stores/emoji";
import { transformStreamerEmojis } from "~/features/emoji/utils";
import ipcService from "~/services/ipc";
import { StreamerLive } from "~/services/ipc/types";
import { Channel, MetadataUpdateEvent } from "~/types";
import { makeBroadcastState } from "../utils";

const validateStreamerLive = (streamerLive: StreamerLive | null) => {
  if (!streamerLive || !streamerLive.isLive) {
    throw Error("방송 중이 아닙니다. 연결할 수 없습니다.");
  }
};

export enum ConnectStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
}

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
  connectStatus: ConnectStatus;
  setChannel(channel: Channel): void;
  setBroadcast(broadcast: Partial<BroadcastState>): void;
  setConnectStatus(status: ConnectStatus): void;
  connect(channel: Channel): Promise<void>;
  disconnect(): Promise<void>;
  reset(): void;
  handleMetadataUpdate(e: MetadataUpdateEvent): void;
  restoreFromMainController(): Promise<void>;
}

/**
 * @description 현재 접속중인 채널에 관한 정보를 관리합니다.
 */
export const useChannel = create<ChannelState>((set) => ({
  channel: null,
  broadcast: null,
  connectStatus: ConnectStatus.DISCONNECTED,
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
  setConnectStatus(status) {
    set({ connectStatus: status });
  },
  async connect(channel) {
    set({ connectStatus: ConnectStatus.CONNECTING });
    try {
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
      const emojiStore = useEmoji.getState();
      emojiStore.update(
        mergeWithDefault(transformStreamerEmojis(channel.id, emojis))
      );

      // 채널 업데이트
      set({
        channel,
        broadcast: makeBroadcastState(streamerLive!, station),
      });

      // 채널 연결
      await ipcService.channel.connectChannel(channel.id);
      set({ connectStatus: ConnectStatus.CONNECTED });
    } catch (error) {
      console.error("Connection failed:", error);
      set({ connectStatus: ConnectStatus.DISCONNECTED });
      throw error;
    }
  },
  async disconnect() {
    set({ connectStatus: ConnectStatus.CONNECTING });
    try {
      await ipcService.channel.disconnectChannel();
      set({
        channel: null,
        broadcast: null,
        connectStatus: ConnectStatus.DISCONNECTED,
      });
    } catch (error) {
      console.error("Disconnect failed:", error);
      set({ connectStatus: ConnectStatus.CONNECTED });
      throw error;
    }
  },
  reset() {
    set({
      channel: null,
      broadcast: null,
      connectStatus: ConnectStatus.DISCONNECTED,
    });
  },
  handleMetadataUpdate(e) {
    set((state) => ({
      broadcast: state.broadcast
        ? {
            ...state.broadcast,
            title: e.title,
            viewerCount: e.viewerCount,
            start: e.startedAt,
          }
        : null,
    }));
  },
  async restoreFromMainController() {
    try {
      const context = await ipcService.channel.getMainControllerContext();

      if (context) {
        // 채널 정보 복원
        const channels = await ipcService.channel.getChannels();
        const channel = channels.find((c) => c.id === context.channelId);

        if (channel) {
          // BroadcastState 복원
          const broadcastState: BroadcastState = {
            title: context.broadcastMetadata.title,
            viewerCount: context.broadcastMetadata.viewerCount,
            start: context.broadcastMetadata.startedAt,
            isPassword: false, // 메타데이터에 없으므로 기본값
            categories: [], // 메타데이터에 없으므로 기본값
          };

          set({
            channel,
            broadcast: broadcastState,
            connectStatus: ConnectStatus.CONNECTED,
          });
        }
      }
    } catch (error) {
      console.error("Failed to restore channel state:", error);
    }
  },
}));
