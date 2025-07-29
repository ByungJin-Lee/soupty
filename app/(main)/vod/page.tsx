"use client";

import { useEffect, useState } from "react";
import { HistoryChannelCondition } from "~/features/history/components/history-channel-condition";
import { VODItem } from "~/features/vod/components/vod-item";
import ipcService from "~/services/ipc";
import { StreamerVOD } from "~/services/ipc/types";
import { Channel } from "~/types";

export default function ClipPage() {
  const [channel, setChannel] = useState<Channel>();
  const [vods, setVODs] = useState<StreamerVOD[]>([]);

  useEffect(() => {
    if (!channel) return;

    ipcService.soop.getStreamerVODList(channel.id, 1).then((v) => {
      if (v) setVODs(v);
    });
  }, [channel]);

  return (
    <div className="flex-1 overflow-y-scroll invisible-scrollbar">
      <HistoryChannelCondition channel={channel} onSelect={setChannel} />
      <div className="grid grid-cols-3">
        {vods.map((v) => (
          <VODItem key={v.id} data={v} />
        ))}
      </div>
    </div>
  );
}
