import { UserStatus, UserSubscribe } from "~/types";

export interface UserPopoverPayload {
  id: string;
  label: string;
  status?: UserStatus;
  subscribe?: UserSubscribe;
  // user 외 broadcast payload 등
  broadcastSessionId?: number;
  channelId?: string;
}
