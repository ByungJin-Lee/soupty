import { BaseEvent } from "./base";

export interface SubscribeEvent extends BaseEvent {
  id: string;
  channelId: string;
  label: string;
  /**
   * @description 구독갱신 길이를 의미합니다.
   */
  renew: number;
  /**
   * @description 구독 티어를 의미합니다.
   */
  tier: number;
  userId: string;
}
