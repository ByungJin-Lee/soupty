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
