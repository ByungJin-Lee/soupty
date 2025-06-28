"use client";

import { Chats } from "~/features/chat/components/chats";
import { useSOOPConnection } from "~/features/soop/hooks/soop-connection";

export default function LivePage() {
  const { connect, disconnect } = useSOOPConnection({
    id: "alice427",
    label: "test",
  });

  return (
    <>
      <Chats />
      <div>
        <button onClick={connect}>연결</button>
        <br />
        <button onClick={disconnect}>연결 종료</button>
      </div>
      <div>3</div>
    </>
  );
}
