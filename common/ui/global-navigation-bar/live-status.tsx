"use client";

import { formatChannelImage } from "~/common/utils/format";
import { useChannel } from "~/features/soop/stores/channel";

export const LiveStatus = () => {
  const { channel } = useChannel();

  return (
    <div className="flex">
      <img
        src={channel ? formatChannelImage(channel) : "/default"}
        title={channel?.label}
        alt="프로필 이미지"
        referrerPolicy="no-referrer"
      />
      <span>채널: {channel?.label}</span>
    </div>
  );
};
