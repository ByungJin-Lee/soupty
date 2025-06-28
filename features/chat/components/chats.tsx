"use client";

import { useChatEventStore } from "~/common/stores/chat-event-store";
import { useAutoScroll } from "../hooks/use-auto-scroll";
import { ChatRow } from "./chat-row";

export const Chats = () => {
  const chatQueue = useChatEventStore((s) => s.chatQueue);
  const lastChatUpdate = useChatEventStore((s) => s.lastChatUpdate);

  const { containerRef, scrollAnchorRef, checkIfAtBottom } = useAutoScroll(
    lastChatUpdate,
    {
      threshold: 50,
      behavior: "smooth",
    }
  );

  const messages = chatQueue.getAll();

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-scroll"
      onScroll={checkIfAtBottom}
    >
      {messages.map((v) => (
        <ChatRow key={v.id} data={v} />
      ))}
      {/* 스크롤 앵커: 항상 최하단에 위치 */}
      <div ref={scrollAnchorRef} />
    </div>
  );
};
