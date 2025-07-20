import { UserStatus, UserSubscribe } from "~/types";

export interface UserPopoverPayload {
  id: string;
  label: string;
  status?: UserStatus;
  subscribe?: UserSubscribe;
}
