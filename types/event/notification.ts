import { BaseEvent } from "./base";

export interface NotificationEvent extends BaseEvent {
  channelId: string;
  message: string;
  show: boolean;
}