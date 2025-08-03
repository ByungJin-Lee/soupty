import { BaseEvent } from "./base";

export interface StickerEvent extends BaseEvent {
  /**
   * @description 수량
   */
  amount: number;
  /**
   * 채널 이름
   */
  channelId: string;
  /**
   * @description 서포터가 되는 경우 숫자가 부여됩니다. 기존 서포터: 0
   */
  supporterOrdinal: number;
  /**
   * @description 제공한 사람의 아이디
   */
  from: string;
  /**
   * @description 제공한 사람의 닉네임
   */
  fromLabel: string;
}
