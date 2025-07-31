import { useMemo, useState } from "react";
import { useQueriesParam } from "~/common/hooks";
import { route } from "~/constants";
import { BroadcastSession, UserSearchFilters } from "~/services/ipc/types";
import { Channel } from "~/types";

// User 검색 필터: user_id (required), channel_id (optional), session_id (optional), period (optional)

interface Filter {
  userId: string;
  channel?: Channel;
  session?: BroadcastSession;
  startDate?: string;
  endDate?: string;
}

interface UserFilterQueries extends Record<string, unknown> {
  userId: string;
  channelId?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
}

export const useHistoryUserFilter = () => {
  const [queryParams, queryActions] = useQueriesParam<UserFilterQueries>(
    `${route.history}?type=user`,
    {
      userId: "",
      channelId: undefined,
      sessionId: undefined,
      startDate: undefined,
      endDate: undefined,
    }
  );

  // 복잡한 객체들은 별도 상태로 관리
  const [channel, setChannel] = useState<Channel>();
  const [session, setSession] = useState<BroadcastSession>();

  const filter = useMemo<Filter>(
    () => ({
      userId: queryParams.userId || "",
      channel,
      session,
      startDate: queryParams.startDate || undefined,
      endDate: queryParams.endDate || undefined,
    }),
    [channel, queryParams, session]
  );

  const updateFilter = {
    setUserId: (userId: string) => {
      queryActions.setValue("userId", userId);
    },
    setChannel: (newChannel?: Channel) => {
      setChannel(newChannel);
      queryActions.setValue("channelId", newChannel?.id?.toString());
    },
    setSession: (newSession?: BroadcastSession) => {
      setSession(newSession);
      queryActions.setValue("sessionId", newSession?.id?.toString());
    },
    setStartDate: (startDate?: string) => {
      queryActions.setValue("startDate", startDate);
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

export const convertFilter = (filter: Filter): UserSearchFilters => ({
  userId: filter.userId,
  channelId: filter.channel?.id,
  sessionId: filter.session?.id,
  startDate: filter.startDate && new Date(filter.startDate).toISOString(),
  endDate: filter.endDate && new Date(filter.endDate).toISOString(),
});