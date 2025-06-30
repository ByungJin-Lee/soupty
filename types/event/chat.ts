import { Badge } from "../badge";
import { OGQ, User } from "../soop";
import { BaseEvent } from "./base";

export enum ChatType {
  /**
   * @description 일반 채팅을 말합니다. (단, OGQ가 아닌 이모티콘 채팅을 포함)
   */
  Common,
  /**
   * @description 매니저 채팅을 말합니다.
   */
  Manager,
  /**
   * @description OGQ 이모티콘 챗을 말합니다.
   */
  Emoticon,
}

/**
 * @description 전처리된 메세지 타입입니다
 */
export enum MessageType {
  Text,
  Emoji,
  OGQ,
}

export interface MessageEmoji {
  title: string;
  imageUrl: string;
}

/**
 * @description chat의 comment string을 전처리한 결과입니다.
 */
export type MessagePart =
  | { type: MessageType.Text; value: string }
  | { type: MessageType.Emoji; value: MessageEmoji }
  | { type: MessageType.OGQ; value: string };

/**
 * @description 전처리를 거치지 않은 chat 이벤트입니다.
 */
export interface RawChatEvent extends BaseEvent {
  /**
   * @description Raw text data 입니다. 전처리를 거쳐야합니다.
   */
  comment: string;
  type: ChatType;
  user: User;
  /**
   * @description 매니저 채팅에서만 활성화됩니다.
   * @default false
   */
  isAdmin: boolean;
  /**
   * @description OGQ 이모티콘에서만 활성화됩니다.
   */
  ogq: OGQ | undefined;
}

/**
 * @description 전처리 후 실제 사용되는 이벤트입니다.
 */
export interface ChatEvent extends RawChatEvent {
  /**
   * @description 이모티콘, text 가 파싱되어 part 구조에 담깁니다.
   */
  parts: MessagePart[];
  /**
   * @description header에 랜더링될, 뱃지입니다.
   */
  badges: Badge[];
  /**
   * @description 채팅에 표시될 닉네임 색상
   */
  color: string;
}
