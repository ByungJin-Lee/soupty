import { useMemo, useState } from "react";
import { useQueriesParam } from "~/common/hooks";
import { route } from "~/constants";
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

interface ChatFilterQueries extends Record<string, unknown> {
  channelId?: string;
  userId?: string;
  messageType?: string;
  messageContains?: string;
  sessionId?: string;
  startDate?: string;
  username?: string;
  endDate?: string;
}

export const useHistoryChatFilter = () => {
  const [queryParams, queryActions] = useQueriesParam<ChatFilterQueries>(
    `${route.history}?type=chat`,
    {
      channelId: undefined,
      userId: undefined,
      messageType: undefined,
      messageContains: undefined,
      sessionId: undefined,
      startDate: undefined,
      username: undefined,
      endDate: undefined,
    }
  );

  // 복잡한 객체들은 별도 상태로 관리
  const [channel, setChannel] = useState<Channel>();
  const [session, setSession] = useState<BroadcastSession>();

  const filter = useMemo<Filter>(
    () => ({
      channel,
      userId: queryParams.userId || undefined,
      messageType: queryParams.messageType || undefined,
      messageContains: queryParams.messageContains || undefined,
      session,
      startDate: queryParams.startDate || undefined,
      username: queryParams.username || undefined,
      endDate: queryParams.endDate || undefined,
    }),
    [channel, queryParams, session]
  );

  const updateFilter = {
    setChannel: (newChannel?: Channel) => {
      setChannel(newChannel);
      queryActions.setValue("channelId", newChannel?.id?.toString());
    },
    setUserId: (userId?: string) => {
      queryActions.setValue("userId", userId);
    },
    setMessageType: (messageType?: string) => {
      queryActions.setValue("messageType", messageType);
    },
    setMessageContains: (messageContains?: string) => {
      queryActions.setValue("messageContains", messageContains);
    },
    setSession: (newSession?: BroadcastSession) => {
      setSession(newSession);
      queryActions.setValue("sessionId", newSession?.id?.toString());
    },
    setStartDate: (startDate?: string) => {
      queryActions.setValue("startDate", startDate);
    },
    setUsername: (username?: string) => {
      queryActions.setValue("username", username);
    },
    setEndDate: (endDate?: string) => {
      queryActions.setValue("endDate", endDate);
    },
    reset: queryActions.reset,
  };

  return {
    filter,
    updateFilter,
  };
};

export const convertFilter = (filter: Filter): ChatSearchFilters => ({
  ...filter,
  channelId: filter.channel?.id,
  broadcastId: filter.session?.id,
  endDate: filter.endDate && new Date(filter.endDate).toISOString(),
  startDate: filter.startDate && new Date(filter.startDate).toISOString(),
});
