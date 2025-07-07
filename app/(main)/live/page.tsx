"use client";

import { ChatViewer } from "~/features/chat/components/chat-viewer";
import { EventViewer } from "~/features/event/components/event-viewer";
import { ChannelEditModal } from "~/features/soop/components/channel/channel-edit-modal";

export default function LivePage() {
  return (
    <>
      <ChatViewer className="max-w-[500px]" />
      <EventViewer className="max-w-[500px]" />

      <div>
        {/* <ChannelSelectModal isOpen={true} onClose={() => {}} /> */}
        <ChannelEditModal />
      </div>
    </>
  );
}
