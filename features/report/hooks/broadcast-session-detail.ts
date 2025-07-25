import { useCallback, useEffect } from "react";
import { getBroadcastSessionDetail } from "~/services/ipc/broadcast-session";
import { BroadcastSession } from "~/services/ipc/types";
import { useApiState } from "~/common/hooks/api-state";

export const useBroadcastSessionDetail = (sessionId: string | null) => {
  const fetcher = useCallback(async () => {
    if (!sessionId) {
      throw new Error("세션 ID가 제공되지 않았습니다.");
    }
    return await getBroadcastSessionDetail(sessionId);
  }, [sessionId]);

  const { data: session, loading, error, execute } = useApiState<BroadcastSession>(fetcher);

  useEffect(() => {
    if (sessionId) {
      execute();
    }
  }, [sessionId, execute]);

  return {
    session,
    loading,
    error,
  };
};