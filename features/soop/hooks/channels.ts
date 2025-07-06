import useSWR from "swr";
import ipcService from "~/services/ipc";

export const useChannels = () => {
  return useSWR("/channels", () => ipcService.channel.getChannels(), {
    suspense: true,
  });
};
