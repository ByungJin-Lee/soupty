"use client";

import { ChatViewer } from "~/features/chat/components/chat-viewer";
import { EventViewer } from "~/features/event/components/event-viewer";
import { useSOOPConnection } from "~/features/soop/hooks/soop-connection";

export default function LivePage() {
  const { connect, disconnect } = useSOOPConnection({
    id: "",
    label: "test",
  });

  return (
    <>
      <ChatViewer className="max-w-[500px]" />
      <EventViewer className="max-w-[500px]" />
      <div>
        <button onClick={connect}>연결</button>
        <br />
        <button onClick={disconnect}>연결 종료</button>
      </div>
    </>
  );
}
