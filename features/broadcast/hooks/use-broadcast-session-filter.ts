import { useForm } from "react-hook-form";
import { BroadcastSessionSearchFilters } from "~/services/ipc/types";
import { Channel } from "~/types";

export interface BroadcastSessionFilter {
  channel?: Channel;
  startDate?: string;
  endDate?: string;
}

export const useBroadcastSessionFilter = () => {
  return useForm<BroadcastSessionFilter>({
    defaultValues: {
      channel: undefined,
      startDate: undefined,
      endDate: undefined,
    },
  });
};

export const convertBroadcastSessionFilter = (
  filter: BroadcastSessionFilter
): BroadcastSessionSearchFilters => {
  return {
    channelId: filter.channel?.id,
    startDate: filter.startDate,
    endDate: filter.endDate,
  };
};