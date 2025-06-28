import { MessagePart, MessageType } from "~/types/chat";

export const splitTextMessageParts = (message: string): MessagePart[] => {
  return message
    .split(/([^ ]+)/)
    .filter((part) => part !== "")
    .map((part) => ({ type: MessageType.Text, value: part }));
};
