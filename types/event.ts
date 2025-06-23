import { ChatType, MessagePart } from "./chat";
import { OGQ, User } from "./soop";

export interface BaseEvent {
  /**
   * @description 이벤트가 발생한 UTC 시간입니다. 인터넷 환경에 따라 차이가 있습니다.
   */
  timestamp: number;
}

/**
 * @description 전처리를 거치지 않은 chat 이벤트입니다.
 */
export interface RawChatEvent extends BaseEvent {
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

export interface ChatEvent extends RawChatEvent {
  parts: MessagePart[];
}
