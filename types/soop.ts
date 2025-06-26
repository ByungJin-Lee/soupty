export interface Emoji {
  title: string;
  pc_img: string;
  mobile_img: string;
}
/**
 * @description key: title, value: imageUrl
 */
export type EmojiStatic = Record<string, string>;

export interface OGQ {
  id: string;
  number: string;
  ext: string;
  version: string;
}

export interface User {
  id: string;
  label: string;
  status: UserStatus;
  subscribe: UserSubscribe;
}

/**
 * @description 유저의 현재 상태(팬가입, 매니저 등)입니다.
 */
export interface UserStatus {
  isBj: boolean;
  /**
   * @description 0 = 팔로우 아님, 1 | 2 티어에 따름
   */
  follow: number;
  isManager: boolean;
  isTopFan: boolean;
  isFan: boolean;
  isSupporter: boolean;
}

/**
 * @description 구독 상태를 표시합니다.
 */
export interface UserSubscribe {
  /**
   * @description 누적구독 상태입니다.
   */
  acc: number;
  /**
   * @description 현재 구독 상태입니다.
   */
  current: number;
}
