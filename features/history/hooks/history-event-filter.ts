import { useForm } from "react-hook-form";
import { BroadcastSession, EventSearchFilters } from "~/services/ipc/types";
import { Channel, DomainEventType } from "~/types";

export interface EventFilter {
  channel?: Channel;
  userId?: string;
  eventType?: DomainEventType;
  startDate?: string;
  endDate?: string;
  username?: string;
  broadcastSession?: BroadcastSession;
}

export const useHistoryEventFilter = () => {
  return useForm<EventFilter>({
    defaultValues: {
      channel: undefined,
      userId: undefined,
      eventType: undefined,
      startDate: undefined,
      endDate: undefined,
      broadcastSession: undefined,
    },
  });
};

export const convertEventFilter = (filter: EventFilter): EventSearchFilters => {
  return {
    channelId: filter.channel?.id,
    userId: filter.userId,
    eventType: filter.eventType,
    startDate: filter.startDate,
    endDate: filter.endDate,
    broadcastId: filter.broadcastSession?.id,
    username: filter.username,
  };
};
