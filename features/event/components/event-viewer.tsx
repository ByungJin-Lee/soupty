"use client";

import { useOtherEventStore } from "~/common/stores/other-event-store";
import { useAutoScroll } from "~/features/chat";
import { EventRow } from "./event-row";

type Props = {
  className?: string;
};

export const EventViewer: React.FC<Props> = ({ className = "" }) => {
  const eventQueue = useOtherEventStore((s) => s.otherQueue);
  const lastUpdate = useOtherEventStore((s) => s.lastUpdate);

  const { containerRef, scrollAnchorRef, checkIfAtBottom } = useAutoScroll(
    lastUpdate,
    {
      threshold: 50,
      behavior: "smooth",
    }
  );

  const events = eventQueue.getAll();

  return (
    <div
      className={`overflow-y-scroll invisible-scrollbar ${className}`}
      ref={containerRef}
      onScroll={checkIfAtBottom}
    >
      <div>
        {events.map((v) => (
          <EventRow key={v.id} data={v} />
        ))}
        {/* 스크롤 앵커: 항상 최하단에 위치 */}
        <div ref={scrollAnchorRef} />
      </div>
    </div>
  );
};
