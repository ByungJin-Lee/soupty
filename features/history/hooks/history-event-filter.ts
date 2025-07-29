import { useMemo, useState } from "react";
import { useQueriesParam } from "~/common/hooks";
import { route } from "~/constants";
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

export interface EventFilterQueries extends Record<string, unknown> {
  channelId?: string;
  userId?: string;
  eventType?: DomainEventType;
  startDate?: string;
  endDate?: string;
  username?: string;
  broadcastSessionId?: string;
}

export const useHistoryEventFilter = () => {
  const [queryParams, queryActions] = useQueriesParam<EventFilterQueries>(
    `${route.history}?type=event`,
    {
      channelId: undefined,
      userId: undefined,
      eventType: undefined,
      startDate: undefined,
      endDate: undefined,
      username: undefined,
      broadcastSessionId: undefined,
    }
  );

  // 복잡한 객체들은 별도 상태로 관리
  const [channel, setChannel] = useState<Channel>();
  const [broadcastSession, setBroadcastSession] = useState<BroadcastSession>();

  const filter = useMemo<EventFilter>(
    () => ({
      channel,
      userId: queryParams.userId || undefined,
      eventType: queryParams.eventType,
      startDate: queryParams.startDate || undefined,
      endDate: queryParams.endDate || undefined,
      username: queryParams.username || undefined,
      broadcastSession,
    }),
    [channel, queryParams, broadcastSession]
  );

  const updateFilter = {
    setChannel: (newChannel?: Channel) => {
      setChannel(newChannel);
      queryActions.setValue("channelId", newChannel?.id?.toString());
    },
    setUserId: (userId?: string) => {
      queryActions.setValue("userId", userId);
    },
    setEventType: (eventType?: DomainEventType) => {
      queryActions.setValue("eventType", eventType);
    },
    setStartDate: (startDate?: string) => {
      queryActions.setValue("startDate", startDate);
    },
    setEndDate: (endDate?: string) => {
      queryActions.setValue("endDate", endDate);
    },
    setUsername: (username?: string) => {
      queryActions.setValue("username", username);
    },
    setBroadcastSession: (newSession?: BroadcastSession) => {
      setBroadcastSession(newSession);
      queryActions.setValue("broadcastSessionId", newSession?.id?.toString());
    },
    reset: queryActions.reset,
  };

  return {
    filter,
    updateFilter,
  };
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
