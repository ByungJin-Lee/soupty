import { ChatEvent } from "./chat";
import { DonationEvent } from "./donation";
import { EnterEvent, ExitEvent } from "./enter-exit";
import { GiftEvent } from "./gift";
import {
  BJStateChangeEvent,
  ConnectedEvent,
  DisconnectedEvent,
  MetadataUpdateEvent,
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
import { StickerEvent } from "./sticker";
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
  Sticker = "Sticker",
  Gift = "Gift",

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
  MetadataUpdate = "MetadataUpdate",
}

export const domainEventLabel: Record<DomainEventType, string> = {
  [DomainEventType.Sticker]: "스티커",
  [DomainEventType.Gift]: "선물",
  [DomainEventType.Donation]: "후원",
  [DomainEventType.Subscribe]: "구독",
  [DomainEventType.Kick]: "강제퇴장",
  [DomainEventType.KickCancel]: "강제퇴장 취소",
  [DomainEventType.Mute]: "채팅금지",
  [DomainEventType.Black]: "블랙",
  [DomainEventType.Freeze]: "얼리기",
  [DomainEventType.Notification]: "알림",
  [DomainEventType.MissionDonation]: "미션 후원",
  [DomainEventType.MissionTotal]: "미션 합계",
  [DomainEventType.BattleMissionResult]: "배틀 미션 결과",
  [DomainEventType.ChallengeMissionResult]: "챌린지 미션 결과",
  [DomainEventType.Slow]: "슬로우",
  [DomainEventType.MetadataUpdate]: "메타데이터 업데이트",
  [DomainEventType.Connected]: "",
  [DomainEventType.Disconnected]: "",
  [DomainEventType.BJStateChange]: "",
  [DomainEventType.Chat]: "채팅",
  [DomainEventType.Enter]: "",
  [DomainEventType.Exit]: "",
};

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
  | _DomainMap<DomainEventType.Sticker, StickerEvent>
  | _DomainMap<DomainEventType.Gift, GiftEvent>

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
  | _DomainMap<DomainEventType.Notification, NotificationEvent>
  | _DomainMap<DomainEventType.MetadataUpdate, MetadataUpdateEvent>;
