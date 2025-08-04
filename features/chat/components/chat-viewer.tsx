"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAutoScroll } from "~/common/hooks/auto-scroll";
import { useChatEventStore } from "~/common/stores/chat-event-store";
import { ChatEvent } from "~/types";
import { ChatView } from "./chat-view";

type Props = {
  className?: string;
};

export const ChatViewer: React.FC<Props> = ({ className = "" }) => {
  const chatQueue = useChatEventStore((s) => s.chatQueue);
  const lastChatUpdate = useChatEventStore((s) => s.lastUpdate);
  const setOnRemoveItems = useChatEventStore((s) => s.setOnRemoveItems);

  const { scrollAnchorRef, adjustScrollPosition } = useAutoScroll(
    lastChatUpdate,
    {
      threshold: 100,
      behavior: "smooth",
    }
  );

  // 제거된 채팅 아이템의 높이를 저장하는 Map
  const itemHeights = useRef(new Map<string, number>());

  // 아이템 높이를 측정하고 저장하는 함수
  const measureItemHeight = useCallback(
    (element: HTMLElement, itemId: string) => {
      if (element) {
        const height = element.offsetHeight;
        itemHeights.current.set(itemId, height);
      }
    },
    []
  );

  const handleRemoveItems = useCallback(
    (removedItems: ChatEvent[]) => {
      if (removedItems.length === 0) return;

      let totalRemovedHeight = 0;

      // 제거된 모든 아이템의 높이 합계 계산
      removedItems.forEach((removedItem) => {
        const itemId = removedItem.id;
        const height = itemHeights.current.get(itemId);

        if (height !== undefined) {
          totalRemovedHeight += height;
          itemHeights.current.delete(itemId);
        }
      });

      // 스크롤 위치 보정
      if (totalRemovedHeight > 0) {
        adjustScrollPosition(totalRemovedHeight);
      }
    },
    [adjustScrollPosition]
  );

  useEffect(() => {
    setOnRemoveItems(handleRemoveItems);
  }, [setOnRemoveItems, handleRemoveItems]);

  const messages = chatQueue.getAll();

  return (
    <div className={className}>
      <ChatView messages={messages} onItemMeasure={measureItemHeight} />
      {/* 스크롤 앵커: 항상 최하단에 위치 */}
      <div ref={scrollAnchorRef} />
    </div>
  );
};
