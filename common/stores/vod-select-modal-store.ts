import { create } from "zustand";
import { StreamerVOD } from "~/services/ipc/types";

type VodSelectStatus = "idle" | "waiting";

interface VodSelectStoreState {
  status: VodSelectStatus;
  title: string;
  selectedChannelId?: string;
  resolve?: (value?: StreamerVOD | null) => void;
}

interface VodSelectStoreAction {
  selectVod(title: string, channelId?: string): Promise<StreamerVOD | null | undefined>;
  confirm(vod?: StreamerVOD | null): void;
  cancel(): void;
}

export const useVodSelectStore = create<VodSelectStoreState & VodSelectStoreAction>(
  (set) => ({
    status: "idle",
    title: "",
    selectedChannelId: undefined,
    resolve: undefined,
    selectVod(title, channelId) {
      return new Promise<StreamerVOD | undefined | null>((resolve) => {
        set({
          title,
          selectedChannelId: channelId,
          status: "waiting",
          resolve,
        });
      });
    },
    confirm(vod) {
      set((s) => {
        s.resolve?.(vod);
        return {
          status: "idle",
          resolve: undefined,
          title: "",
          selectedChannelId: undefined,
        };
      });
    },
    cancel() {
      set((s) => {
        s.resolve?.(null);
        return {
          status: "idle",
          resolve: undefined,
          title: "",
          selectedChannelId: undefined,
        };
      });
    },
  })
);

export const selectVod = async (title: string, channelId?: string) => {
  return useVodSelectStore.getState().selectVod(title, channelId);
};