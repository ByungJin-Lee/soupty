import { StreamerLive, StreamerStation } from "~/services/ipc/types";
import { BroadcastState } from "./stores/channel";

export const makeBroadcastState = (
  live: StreamerLive,
  station: StreamerStation
): BroadcastState => {
  return {
    title: live.title,
    isPassword: station.is_password,
    start: station.broad_start,
    viewerCount: station.viewer_count,
    categories: live.categories,
  };
};
