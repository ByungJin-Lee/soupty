import { ipcClient } from "./base";
import { IpcRequestWithPayload, IpcRequestWithoutPayload } from "./types";

/**
 * @description TargetUsers 관련 IPC 요청을 처리하는 객체입니다.
 */
export const targetUsers = Object.freeze({
  /**
   * targetUsers 목록을 가져옵니다
   */
  async getTargetUsers() {
    return ipcClient(IpcRequestWithoutPayload.GetTargetUsers);
  },

  /**
   * targetUsers에 사용자를 추가합니다
   */
  async addTargetUser(userId: string) {
    return ipcClient(IpcRequestWithPayload.AddTargetUser, { userId });
  },

  /**
   * targetUsers에서 사용자를 제거합니다
   */
  async removeTargetUser(userId: string) {
    return ipcClient(IpcRequestWithPayload.RemoveTargetUser, { userId });
  },
});