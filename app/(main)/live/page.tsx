"use client";

import { ChatViewer } from "~/features/chat/components/chat-viewer";
import { EventViewer } from "~/features/event/components/event-viewer";
import { ChannelEditModal } from "~/features/soop/components/channel/channel-edit-modal";
import { ActiveViewerChart } from "~/features/stats/components/active-viewer-chart";
import { WordCloud } from "~/features/stats/components/word-cloud";

export default function LivePage() {
  return (
    <>
      <ChatViewer className="max-w-[500px]" />
      <EventViewer className="max-w-[500px]" />

      <div className="w-[250px] max-w-[300px]">
        <ActiveViewerChart />
        <WordCloud />
        {/* <LOLChart /> */}
        {/* <CPMChart /> */}
        {/* <ChannelSelectModal isOpen={true} onClose={() => {}} /> */}
        <ChannelEditModal />
      </div>
    </>
  );
}
