"use client";

import { useChatLog } from "../stores/chat-log";
import { ChatRow } from "./chat-row";

export const Chats = () => {
  const chats = useChatLog((s) => s.chats);

  return (
    <div className="">
      {chats.map((v, i) => (
        <ChatRow key={i} data={v} />
      ))}
    </div>
  );
};
