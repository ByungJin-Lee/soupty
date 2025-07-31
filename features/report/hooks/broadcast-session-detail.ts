import useSWR from "swr";
import { route } from "~/constants";
import { getBroadcastSessionDetail } from "~/services/ipc/broadcast-session";

export const useBroadcastSessionDetail = (sessionId: string | null) => {
  if (!sessionId) {
    throw Error("");
  }

  const {
    data: session,
    isLoading,
    error,
  } = useSWR(route.broadcastSession(sessionId), () =>
    getBroadcastSessionDetail(sessionId)
  );

  return {
    session,
    isLoading,
    error,
  };
};
