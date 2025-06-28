import { StreamerLive, StreamerStation } from "~/services/ipc/types";
import { BroadcastState } from "./stores/channel";

export const makeBroadcastState = (
  live: StreamerLive,
  station: StreamerStation
): BroadcastState => {
  return {
    title: live.title,
    isPassword: station.isPassword,
    start: station.broad_start,
    viewerCount: station.viewerCount,
    categories: live.categories,
  };
};
