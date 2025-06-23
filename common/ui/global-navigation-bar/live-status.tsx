"use client";

import { useLiveChannel } from "~/common/stores/live-channel";

export const LiveStatus = () => {
  const channelState = useLiveChannel();

  return (
    <div className="">
      <span>채널: {channelState.channel?.label}</span>
      <span>{channelState.connected ? "연결됨" : "연결안됨"}</span>
    </div>
  );
};
