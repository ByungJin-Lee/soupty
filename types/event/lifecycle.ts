import { BaseEvent } from "./base";

export type ConnectedEvent = BaseEvent;

export type DisconnectedEvent = BaseEvent;

export interface BJStateChangeEvent extends BaseEvent {
  channelId: string;
  // BJ state change data can be added here if needed
}

export interface MetadataUpdateEvent extends BaseEvent {
  id: string;
  startedAt: string;
  title: string;
  viewerCount: number;
}
