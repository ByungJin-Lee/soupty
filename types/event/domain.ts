import { ChatEvent } from "./chat";
import { DonationEvent } from "./donation";
import { EnterEvent, ExitEvent } from "./enter-exit";
import {
  BJStateChangeEvent,
  ConnectedEvent,
  DisconnectedEvent,
} from "./lifecycle";
import {
  BattleMissionResultEvent,
  ChallengeMissionResultEvent,
  MissionDonationEvent,
  MissionTotalEvent,
} from "./mission";
import {
  BlackEvent,
  FreezeEvent,
  KickCancelEvent,
  KickEvent,
  MuteEvent,
  SlowEvent,
} from "./moderation";
import { NotificationEvent } from "./notification";
import { SubscribeEvent } from "./subscribe";

export enum DomainEventType {
  // Lifecycle events
  Connected = "Connected",
  Disconnected = "Disconnected",
  BJStateChange = "BJStateChange",

  // Chat related events
  Chat = "Chat",
  Donation = "Donation",
  Subscribe = "Subscribe",

  // User events
  Enter = "Enter",
  Exit = "Exit",

  // Moderation events
  Kick = "Kick",
  KickCancel = "KickCancel",
  Mute = "Mute",
  Black = "Black",
  Freeze = "Freeze",
  Slow = "Slow",

  // Mission events
  MissionDonation = "MissionDonation",
  MissionTotal = "MissionTotal",
  ChallengeMissionResult = "ChallengeMissionResult",
  BattleMissionResult = "BattleMissionResult",

  // System events
  Notification = "Notification",
}

export type RawDomainEvent = {
  type: DomainEventType;
  payload: {
    id: string;
  };
};

export interface _DomainMap<T, P> {
  id: string;
  type: T;
  payload: P;
}

export type DomainEvent =
  // Lifecycle events
  | _DomainMap<DomainEventType.Connected, ConnectedEvent>
  | _DomainMap<DomainEventType.Disconnected, DisconnectedEvent>
  | _DomainMap<DomainEventType.BJStateChange, BJStateChangeEvent>

  // Chat related events
  | _DomainMap<DomainEventType.Chat, ChatEvent>
  | _DomainMap<DomainEventType.Donation, DonationEvent>
  | _DomainMap<DomainEventType.Subscribe, SubscribeEvent>

  // User events
  | _DomainMap<DomainEventType.Enter, EnterEvent>
  | _DomainMap<DomainEventType.Exit, ExitEvent>

  // Moderation events
  | _DomainMap<DomainEventType.Kick, KickEvent>
  | _DomainMap<DomainEventType.KickCancel, KickCancelEvent>
  | _DomainMap<DomainEventType.Mute, MuteEvent>
  | _DomainMap<DomainEventType.Black, BlackEvent>
  | _DomainMap<DomainEventType.Freeze, FreezeEvent>
  | _DomainMap<DomainEventType.Slow, SlowEvent>

  // Mission events
  | _DomainMap<DomainEventType.MissionDonation, MissionDonationEvent>
  | _DomainMap<DomainEventType.MissionTotal, MissionTotalEvent>
  | _DomainMap<
      DomainEventType.ChallengeMissionResult,
      ChallengeMissionResultEvent
    >
  | _DomainMap<DomainEventType.BattleMissionResult, BattleMissionResultEvent>

  // System events
  | _DomainMap<DomainEventType.Notification, NotificationEvent>;
