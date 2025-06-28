import { splitTextMessageParts } from "~/features/chat/utils";
import { MessagePart, MessageType } from "~/types/chat";
import { ChatEvent, RawChatEvent } from "~/types/event";

/**
 * Chat 이벤트 처리를 담당하는 클래스
 */
export class ChatProcessor {
  constructor(
    private emojiProcessor?: {
      regex: RegExp;
      process: (text: string, regex: RegExp) => MessagePart[];
    }
  ) {}

  /**
   * emoji 처리기를 업데이트합니다
   */
  updateEmojiProcessor(processor: {
    regex: RegExp;
    process: (text: string, regex: RegExp) => MessagePart[];
  }) {
    this.emojiProcessor = processor;
  }

  /**
   * Raw chat 이벤트를 처리된 chat 이벤트로 변환합니다
   */
  processEvent(rawEvent: RawChatEvent): ChatEvent {
    const event = rawEvent as ChatEvent;
    const message = event.comment;

    let parts: MessagePart[] = [];

    if (event.ogq) {
      parts = [
        {
          type: MessageType.OGQ,
          value: event.ogq,
        },
      ];
    } else {
      // emoji 처리기가 있고 emoji가 매치되는 경우
      if (this.emojiProcessor && message.match(this.emojiProcessor.regex)) {
        parts = this.emojiProcessor.process(message, this.emojiProcessor.regex);
      } else {
        // 일반 텍스트 처리
        parts = splitTextMessageParts(message);
      }
    }

    event.parts = parts;
    return event;
  }
}
