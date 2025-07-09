"use client";

import { ChatViewer } from "~/features/chat/components/chat-viewer";
import { EventViewer } from "~/features/event/components/event-viewer";
import { ChannelEditModal } from "~/features/soop/components/channel/channel-edit-modal";
import { CPMChart } from "~/features/stats/components/cpm-chart";

export default function LivePage() {
  return (
    <>
      <ChatViewer className="max-w-[500px]" />
      <EventViewer className="max-w-[500px]" />

      <div className="w-[400px] max-w-[400px]">
        {/* <ActiveViewerChart /> */}
        {/* <LOLChart /> */}
        <CPMChart />
        {/* <ChannelSelectModal isOpen={true} onClose={() => {}} /> */}
        <ChannelEditModal />
      </div>
    </>
  );
}
