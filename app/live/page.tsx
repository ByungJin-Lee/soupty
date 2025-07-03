"use client";

import { ChatViewer } from "~/features/chat/components/chat-viewer";
import { EventViewer } from "~/features/event/components/event-viewer";
import { useSOOPConnection } from "~/features/soop/hooks/soop-connection";
import ipcService from "~/services/ipc";

export default function LivePage() {
  const { connect, disconnect } = useSOOPConnection({
    id: "phonics1",
    label: "test",
  });

  const handleGetChannel = () => {
    ipcService.channel.getChannels().then((s) => console.log(s));
  };

  const handleUpsert = () => {
    const id = prompt("hello");
    const name = prompt("");

    if (!id || !name) return;

    ipcService.channel.upsertChannel({
      id,
      label: name,
    });
  };

  return (
    <>
      <ChatViewer className="max-w-[500px]" />
      <EventViewer className="max-w-[500px]" />

      <div>
        <button onClick={connect}>연결</button>
        <br />
        <button onClick={disconnect}>연결 종료</button>
        <br />
        <button onClick={handleGetChannel}>get</button>
        <button onClick={handleUpsert}>upsert</button>
      </div>
    </>
  );
}
