"use client";

import { useChannel } from "~/features/soop/stores/channel";

export const LiveStatus = () => {
  const { channel } = useChannel();

  return (
    <div className="">
      <span>채널: {channel?.label}</span>
      <span>연결됨</span>
    </div>
  );
};
