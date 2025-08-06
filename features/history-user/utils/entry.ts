import { EventDisplayUtil } from "~/features/event/utils/event-display";
import {
  ChatLogMessageType,
  SimplifiedUserLogEntry,
} from "~/services/ipc/types";
import { DomainEvent, DomainEventType, RawChatEvent } from "~/types";

export const getUserIdFromDomainEvent = (e: DomainEvent) => {
  switch (e.type) {
    case DomainEventType.Donation:
      return e.payload.from;
    case DomainEventType.MissionDonation:
      return e.payload.from;
    case DomainEventType.Mute:
      return e.payload.user.id;
    case DomainEventType.Subscribe:
      return e.payload.userId;
    case DomainEventType.Kick:
      return e.payload.user.id;
    case DomainEventType.Sticker:
      return e.payload.from;
    case DomainEventType.Gift:
      return e.payload.senderId;
  }
};

export const transformChatToLogEntry = (
  chat: RawChatEvent
): SimplifiedUserLogEntry => ({
  id: chat.id,
  logType: "CHAT",
  timestamp: chat.timestamp,
  user: chat.user,
  messageType: chat.ogq ? ChatLogMessageType.Emotion : ChatLogMessageType.Text,
  message: chat.comment,
  metadata: chat.ogq
    ? {
        emoticon: chat.ogq,
      }
    : undefined,
});

export const transformEventToLogEntry = (
  event: DomainEvent
): SimplifiedUserLogEntry => ({
  id: event.id,
  logType: "EVENT",
  timestamp: event.payload.timestamp,
  user: EventDisplayUtil.extractUser(event),
  eventType: event.type,
  payload: event.payload as unknown as string,
});

export const sortEntry = (logs: SimplifiedUserLogEntry[]) =>
  logs.toSorted((lhs, rhs) => lhs.timestamp.localeCompare(rhs.timestamp));
