import { openWebviewWindowWithPayload } from "~/common/utils/window";
import { route } from "~/constants";
import { useChannel } from "~/features/soop";
import { HistoryUserOpenerParams } from "../types/opener";

import { useChatEventStore } from "~/common/stores/chat-event-store";
import { useOtherEventStore } from "~/common/stores/other-event-store";
import { SimplifiedUserLogEntry } from "~/services/ipc/types";
import {
  getUserIdFromDomainEvent,
  transformChatToLogEntry,
  transformEventToLogEntry,
} from "./entry";

const getLiveLog = (userId: string): SimplifiedUserLogEntry[] => {
  const recentChats = useChatEventStore
    .getState()
    .chatQueue.getFiltered((it) => it.user.id === userId)
    .map(transformChatToLogEntry);
  const recentEvents = useOtherEventStore
    .getState()
    .otherQueue.getFiltered((it) => getUserIdFromDomainEvent(it) === userId)
    .map(transformEventToLogEntry);

  return [...recentChats, ...recentEvents].toSorted((lhs, rhs) =>
    lhs.timestamp.localeCompare(rhs.timestamp)
  );
};

export const openHistoryUser = (params: HistoryUserOpenerParams) => {
  const getPayload = () => {
    const channel = useChannel.getState().channel;

    if (channel?.id !== params.channelId) return;

    return getLiveLog(params.userId);
  };

  return openWebviewWindowWithPayload(
    historyUserOpenerKey(params.userId, params.channelId),
    `${params.userLabel}(${params.userId}) 채팅 기록`,
    route.historyUser(params.userId, params.channelId),
    getPayload
  );
};

export const historyUserOpenerKey = (userId: string, channelId: string) =>
  `history-user-${userId}-${channelId}`;
