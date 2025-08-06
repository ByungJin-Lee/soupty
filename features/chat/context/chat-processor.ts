import { createContext, useContext } from "react";
import { ChatProcessor } from "../processors/chat-processor";

const ctx = createContext<ChatProcessor | null>(null);

export const ChatProcessorProvider = ctx.Provider;

export const useChatProcessorContext = () => {
  const value = useContext(ctx);

  if (!value) {
    throw Error("");
  }

  return value;
};
