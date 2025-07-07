import { mutate } from "swr";
import { create } from "zustand";
import ipcService from "~/services/ipc";
import { Channel } from "~/types";

const executeWithLoading = async (
  set: (state: Partial<ChannelEditState>) => void,
  operation: () => Promise<void>
) => {
  set({ isLoading: true });
  try {
    await operation();
    set({ isOpen: false, channel: undefined });
    mutate("/channels");
  } catch (error) {
    console.error("Channel operation failed:", error);
  } finally {
    set({ isLoading: false });
  }
};

interface ChannelEditState {
  isOpen: boolean;
  mode: "create" | "edit";
  channel?: Channel;
  isLoading: boolean;

  // Actions
  openCreate: () => void;
  openEdit: (channel: Channel) => void;
  close: () => void;
  submit: (data: { id: string; label: string }) => Promise<void>;
  delete: (channelId: string) => Promise<void>;
}

export const useChannelEdit = create<ChannelEditState>((set) => ({
  isOpen: false,
  mode: "create",
  channel: undefined,
  isLoading: false,

  openCreate: () => {
    set({
      isOpen: true,
      mode: "create",
      channel: undefined,
    });
  },

  openEdit: (channel: Channel) => {
    set({
      isOpen: true,
      mode: "edit",
      channel,
    });
  },

  close: () => {
    set({
      isOpen: false,
      channel: undefined,
      isLoading: false,
    });
  },

  submit: async (data: { id: string; label: string }) => {
    await executeWithLoading(set, async () => {
      const channelData: Channel = {
        id: data.id,
        label: data.label,
      };
      await ipcService.channel.upsertChannel(channelData);
    });
  },

  delete: async (channelId: string) => {
    await executeWithLoading(set, async () => {
      await ipcService.channel.deleteChannel(channelId);
    });
  },
}));
