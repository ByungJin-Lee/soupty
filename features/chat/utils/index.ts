import { MessagePart, MessageType } from "~/types/chat";

const urlRegex = /https?:\/\/[^\s]+/gi;

export const splitTextMessageParts = (message: string): MessagePart[] => {
  return message
    .split(/([^ ]+)/)
    .filter((part) => part !== "")
    .map((part) => {
      if (urlRegex.test(part)) {
        return { type: MessageType.URL, value: part };
      }
      return { type: MessageType.Text, value: part };
    });
};
