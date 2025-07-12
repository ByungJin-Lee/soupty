import { BaseEvent } from "./base";

export interface ConnectedEvent extends BaseEvent {
  // Connection related data can be added here if needed
}

export interface DisconnectedEvent extends BaseEvent {
  // Disconnection related data can be added here if needed
}

export interface BJStateChangeEvent extends BaseEvent {
  channelId: string;
  // BJ state change data can be added here if needed
}