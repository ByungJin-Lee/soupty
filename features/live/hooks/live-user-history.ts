import { useMemo } from "react";
import { useChatEventStore } from "~/common/stores/chat-event-store";
import { useOtherEventStore } from "~/common/stores/other-event-store";
import { ChatEvent, DomainEvent, DomainEventType } from "~/types";

export type History =
  | {
      variant: "event";
      id: string;
      data: DomainEvent;
      timestamp: string;
    }
  | {
      variant: "chat";
      id: string;
      data: ChatEvent;
      timestamp: string;
    };

const getUserIdFromDomainEvent = (e: DomainEvent) => {
  switch (e.type) {
    case DomainEventType.Donation:
      return e.payload.from;
    case DomainEventType.MissionDonation:
      return e.payload.from;
    case DomainEventType.Mute:
      return e.payload.user.id;
    case DomainEventType.Subscribe:
      return e.payload.userId;
  }
};

const chatToHistory = (chat: ChatEvent): History => ({
  variant: "chat",
  id: chat.id,
  data: chat,
  timestamp: chat.timestamp,
});

const eventToHistory = (event: DomainEvent): History => ({
  variant: "event",
  id: event.id,
  data: event,
  timestamp: event.payload.timestamp,
});

export const useLiveUserHistory = (userId: string) => {
  useChatEventStore((v) => v.lastUpdate);
  useOtherEventStore((v) => v.lastUpdate);

  const recentChats = useChatEventStore((s) => s.chatQueue)
    .getFiltered((it) => it.user.id === userId)
    .map(chatToHistory);
  const recentEvents = useOtherEventStore((s) => s.otherQueue)
    .getFiltered((it) => getUserIdFromDomainEvent(it) === userId)
    .map(eventToHistory);

  const histories = useMemo(() => {
    return [...recentChats, ...recentEvents].toSorted((lhs, rhs) =>
      lhs.timestamp.localeCompare(rhs.timestamp)
    );
  }, [recentChats, recentEvents]);

  return {
    histories,
  };
};
