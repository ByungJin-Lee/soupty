import { DomainEventType } from "~/types";
import { CHAT_SETTINGS } from "./feature/chat";
export const MAX_QUEUE_CAPACITY = CHAT_SETTINGS.MAX_QUEUE_CAPACITY;

export const EVENT_COLOR_MAP: Record<DomainEventType, string> = Object.freeze({
  [DomainEventType.Donation]: "text-yellow-600",
  [DomainEventType.Subscribe]: "text-purple-600",
  [DomainEventType.MissionDonation]: "text-blue-600",
  [DomainEventType.MissionTotal]: "text-blue-600",
  [DomainEventType.ChallengeMissionResult]: "text-green-600",
  [DomainEventType.BattleMissionResult]: "text-orange-600",
  [DomainEventType.Mute]: "text-red-600",
  [DomainEventType.Kick]: "text-red-600",
  [DomainEventType.Black]: "text-red-600",
  [DomainEventType.Disconnected]: "text-red-600",
  [DomainEventType.KickCancel]: "text-green-600",
  [DomainEventType.Connected]: "text-green-600",
  [DomainEventType.Enter]: "text-green-600",
  [DomainEventType.Freeze]: "text-blue-600",
  [DomainEventType.Slow]: "text-blue-600",
  [DomainEventType.BJStateChange]: "text-blue-600",
  [DomainEventType.Notification]: "text-indigo-600",
  [DomainEventType.Exit]: "text-gray-600",
  [DomainEventType.Sticker]: "text-purple-600",
  [DomainEventType.Gift]: "text-rose-600",
  [DomainEventType.Chat]: "text-gray-700",
  [DomainEventType.MetadataUpdate]: "text-gray-700",
});
