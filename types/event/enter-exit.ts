import { BaseEvent } from "./base";
import { User } from "../soop";

export interface EnterEvent extends BaseEvent {
  channelId: string;
  user: User;
}

export interface ExitEvent extends BaseEvent {
  channelId: string;
  user: User;
}