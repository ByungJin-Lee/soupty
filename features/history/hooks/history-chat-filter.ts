import { useForm } from "react-hook-form";
import { BroadcastSession, ChatSearchFilters } from "~/services/ipc/types";
import { Channel } from "~/types";

// Channel 선택, 사용자 아이디, 채팅 종류, 방송 아이디, 날짜

interface Filter {
  channel?: Channel;
  userId?: string;
  messageType?: string;
  messageContains?: string;
  session?: BroadcastSession;
  startDate?: string;
  username?: string;
  endDate?: string;
}

export const useHistoryChatFilter = () => {
  return useForm<Filter>({
    mode: "onChange",
    defaultValues: {},
  });
};

export const convertFilter = (filter: Filter): ChatSearchFilters => ({
  ...filter,
  channelId: filter.channel?.id,
  broadcastId: filter.session?.id,
  endDate: filter.endDate && new Date(filter.endDate).toISOString(),
  startDate: filter.startDate && new Date(filter.startDate).toISOString(),
});
