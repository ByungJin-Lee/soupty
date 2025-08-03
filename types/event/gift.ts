import { BaseEvent } from "./base";

export enum GiftType {
  OGQ = "OGQ",
  Subscription = "Subscription",
  QuickView = "QuickView",
}

export const giftTypeLabel: Record<GiftType, string> = {
  [GiftType.OGQ]: "OGQ",
  [GiftType.Subscription]: "구독권",
  [GiftType.QuickView]: "퀵뷰",
};

export const unpackGift = (giftType: GiftType, giftCode: string): string => {
  if (giftType === GiftType.OGQ) return giftCode;

  if (giftType === GiftType.Subscription) {
    switch (giftCode) {
      case "1":
        return "구독 1개월";
      case "2":
        return "구독 3개월";
      case "3":
        return "구독 6개월";
    }
  }

  if (giftType === GiftType.QuickView) {
    switch (giftCode) {
      case "1":
        return "퀵뷰 1달";
      case "2":
        return "퀵뷰 3달";
      case "3":
        return "퀵뷰 1년";
      case "100":
        return "퀵뷰+ 7일";
      case "101":
        return "퀵뷰+ 1개월";
      case "102":
        return "퀵뷰+ 3개월";
      case "103":
        return "퀵뷰+ 1년";
    }
  }

  return "";
};

export interface GiftEvent extends BaseEvent {
  /**
   * 채널 이름
   */
  channelId: string;
  /**
   * @description 선물 종류
   */
  giftType: GiftType;
  /**
   * @description 선물을 제공한 사람의 아이디
   */
  senderId: string;
  /**
   * @description 선물을 제공한 사람의 닉네임
   */
  senderLabel: string;
  /**
   * @description 받은 사람의 아이디
   */
  receiverId: string;
  /**
   * @description 받은 사람의 이름
   */
  receiverLabel: string;
  /**
   * @description 선물 코드
   */
  giftCode: string;
}
