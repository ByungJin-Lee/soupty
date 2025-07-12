"use client";

import { useAutoScroll } from "~/common/hooks/auto-scroll";
import { useChatEventStore } from "~/common/stores/chat-event-store";
import { ChatView } from "./chat-view";

type Props = {
  className?: string;
};

export const ChatViewer: React.FC<Props> = ({ className = "" }) => {
  const chatQueue = useChatEventStore((s) => s.chatQueue);
  const lastChatUpdate = useChatEventStore((s) => s.lastUpdate);

  const { containerRef, scrollAnchorRef, checkIfAtBottom } = useAutoScroll(
    lastChatUpdate,
    {
      threshold: 100,
      behavior: "smooth",
    }
  );

  const messages = chatQueue.getAll();

  return (
    <div ref={containerRef} onScroll={checkIfAtBottom} className={className}>
      <ChatView messages={messages} />
      {/* 스크롤 앵커: 항상 최하단에 위치 */}
      <div ref={scrollAnchorRef} />
    </div>
  );
};
