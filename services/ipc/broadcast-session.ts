import { ipcClient } from "./base";
import {
  BroadcastSession,
  BroadcastSessionSearchFilters,
  BroadcastSessionSearchResult,
  IpcRequestWithPayload,
  PaginationParams,
} from "./types";

export const broadcastSessionService = {
  /**
   * 방송 세션을 삭제합니다.
   */
  async deleteBroadcastSession(broadcastId: number): Promise<void> {
    return await ipcClient(IpcRequestWithPayload.DeleteBroadcastSession, {
      broadcastId,
    });
  },

  /**
   * 방송 세션을 검색합니다.
   */
  async searchBroadcastSessions(
    filters: BroadcastSessionSearchFilters,
    pagination: PaginationParams
  ): Promise<BroadcastSessionSearchResult> {
    return await ipcClient(IpcRequestWithPayload.SearchBroadcastSessions, {
      filters,
      pagination,
    });
  },

  /**
   * 특정 방송 세션의 상세 정보를 가져옵니다.
   */
  async getBroadcastSessionDetail(
    sessionId: string
  ): Promise<BroadcastSession | null> {
    try {
      const broadcastId = parseInt(sessionId, 10);
      if (isNaN(broadcastId)) {
        throw new Error("Invalid session ID");
      }

      return await ipcClient(IpcRequestWithPayload.GetBroadcastSession, {
        broadcastId,
      });
    } catch (error) {
      console.error("Failed to get broadcast session detail:", error);
      return null;
    }
  },

  /**
   * 방송 세션의 종료 시간을 업데이트합니다.
   */
  async updateBroadcastSessionEndTime(
    broadcastId: number,
    endedAt: string
  ): Promise<unknown> {
    return await ipcClient(
      IpcRequestWithPayload.UpdateBroadcastSessionEndTime,
      {
        broadcastId,
        endedAt,
      }
    );
  },
};

// Export individual functions for convenience
export const {
  deleteBroadcastSession,
  searchBroadcastSessions,
  getBroadcastSessionDetail,
  updateBroadcastSessionEndTime,
} = broadcastSessionService;
