"use client";

import { useChatEventStore } from "~/common/stores/chat-event-store";
import { ChatRow } from "./chat-row";

export const Chats = () => {
  const chatQueue = useChatEventStore((s) => s.chatQueue);
  const lastChatUpdate = useChatEventStore((s) => s.lastChatUpdate);

  return (
    <div className="">
      {chatQueue.getAll().map((v, i) => (
        <ChatRow key={`${v.timestamp || i}-${lastChatUpdate}`} data={v} />
      ))}
    </div>
  );
};
