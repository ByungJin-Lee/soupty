"use client";

import { Chats } from "~/features/chat/components/chats";

export default function LivePage() {
  return (
    <div className="grid grid-cols-3">
      <div className="max-h-[300px] overflow-y-scroll">
        <Chats />
      </div>
      <div>3</div>
    </div>
  );
}
