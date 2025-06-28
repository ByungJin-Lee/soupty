import { splitTextMessageParts } from "~/features/chat/utils";
import { EmojiStatic } from "~/types";
import { MessagePart, MessageType } from "~/types/chat";

/**
 * 텍스트에서 emoji를 처리하여 MessagePart 배열로 변환하는 함수
 */
export function createEmojiProcessor(emojiStatic: EmojiStatic) {
  return {
    process: (text: string, regex: RegExp): MessagePart[] => {
      return text.split(regex).flatMap((part, i): MessagePart[] => {
        return i % 2 === 0
          ? splitTextMessageParts(part)
          : [
              {
                type: MessageType.Emoji,
                value: { title: part, imageUrl: emojiStatic[part] },
              },
            ];
      });
    },
  };
}
