"use client";

import { memo } from "react";
import { ChatEvent } from "~/types/event/chat";
import { ChatRow } from "./chat-row";

type Props = {
  messages: ChatEvent[];
  className?: string;
};

export const ChatView: React.FC<Props> = memo(({ messages, className = "" }) => {
  return (
    <div className={className}>
      {messages.map((v) => (
        <ChatRow key={v.id} data={v} />
      ))}
    </div>
  );
});

ChatView.displayName = "ChatView";