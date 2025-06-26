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
}
