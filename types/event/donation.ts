import { BaseEvent } from "./base";

export enum DonationType {
  Balloon = "Balloon",
  ADBalloon = "ADBalloon",
  VODBalloon = "VODBalloon",
}

export const donationTypeLabel: Record<DonationType, string> = {
  [DonationType.Balloon]: "별풍선",
  [DonationType.ADBalloon]: "AD별풍선",
  [DonationType.VODBalloon]: "영상풍선",
};

export interface DonationEvent extends BaseEvent {
  /**
   * @description 수량
   */
  amount: number;
  /**
   * @description 해당 선물로 열혈이 되었는지 여부
   */
  becomeTopFan: boolean;
  /**
   * 채널 이름
   */
  channelId: string;
  /**
   * @description 별풍선 종류
   */
  donationType: DonationType;
  /**
   * @description 팬클럽이 되는 경우 숫자가 부여됩니다. 기존 팬클럽: 0
   */
  fanClubOrdinal: number;
  /**
   * @description 별풍선을 제공한 사람의 아이디
   */
  from: string;
  /**
   * @description 별풍선을 제공한 사람의 닉네임
   */
  fromLabel: string;
  /**
   * @description 후원 메세지입니다. 없을 수 도 있습니다.
   */
  message: string | null;
}
