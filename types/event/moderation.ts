import { User } from "../soop";
import { BaseEvent } from "./base";

export interface KickEvent extends BaseEvent {
  channelId: string;
  user: User;
}

export interface KickCancelEvent extends BaseEvent {
  channelId: string;
  userId: string;
}

export interface MuteEvent extends BaseEvent {
  channelId: string;
  user: User;
  seconds: number;
  message: string;
  by: string;
  counts: number;
  superuserType: string;
}

export interface BlackEvent extends BaseEvent {
  channelId: string;
  userId: string;
}

export interface FreezeEvent extends BaseEvent {
  channelId: string;
  freezed: boolean;
  limitSubscriptionMonth: number;
  limitBalloons: number;
  targets: FreezeTarget[];
}

export enum FreezeTarget {
  Supporter = "SUPPORTER",
  TopFan = "TOP_FAN",
  Follower = "FOLLOWER",
  Manager = "MANAGER",
  BJ = "BJ",
  Fan = "FAN",
}

export const freezeTargetLabel: Record<FreezeTarget, string> = {
  [FreezeTarget.Supporter]: "서포터",
  [FreezeTarget.TopFan]: "열혈",
  [FreezeTarget.Follower]: "구독자",
  [FreezeTarget.Manager]: "매니저",
  [FreezeTarget.BJ]: "방장",
  [FreezeTarget.Fan]: "팬",
};

export interface SlowEvent extends BaseEvent {
  channelId: string;
  duration: number;
}
