"use client";

import { Chats } from "~/features/chat/components/chats";
import { useSOOPConnection } from "~/features/soop/hooks/soop-connection";

export default function LivePage() {
  const { connect, disconnect } = useSOOPConnection({
    id: "htvv2i",
    label: "test",
  });

  return (
    <div className="grid grid-cols-3">
      <div className="max-h-[300px] overflow-y-scroll">
        <Chats />
      </div>
      <div>
        <button onClick={connect}>연결</button>
        <br />
        <button onClick={disconnect}>연결 종료</button>
      </div>
      <div>3</div>
    </div>
  );
}
