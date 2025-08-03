"use client";

import { memo } from "react";
import { ChatEvent } from "~/types/event/chat";
import { ChatRow } from "./chat-row";

type Props = {
  messages: ChatEvent[];
  className?: string;
  onItemMeasure?: (element: HTMLElement, itemId: string) => void;
};

export const ChatView: React.FC<Props> = memo(({ messages, className = "", onItemMeasure }) => {
  return (
    <div className={className}>
      {messages.map((v) => (
        <ChatRow 
          key={v.id} 
          data={v} 
          onMeasure={onItemMeasure}
        />
      ))}
    </div>
  );
});

ChatView.displayName = "ChatView";