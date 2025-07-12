import { BaseEvent } from "./base";
import { User } from "../soop";

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
  targets: string[];
}

export interface SlowEvent extends BaseEvent {
  channelId: string;
  duration: number;
}