import { ipcClient } from "./base";
import { IpcRequestWithoutPayload } from "./types";

/**
 * @description 앱 전체 관련 IPC 서비스
 */
export const app = Object.freeze({
  /**
   * @description 앱의 모든 데이터를 초기화합니다.
   */
  resetApp: async (): Promise<void> => {
    await ipcClient(IpcRequestWithoutPayload.ResetApp);
  },

  /**
   * @description 앱 데이터 디렉토리를 파일 탐색기로 엽니다.
   */
  openAppDataDir: async (): Promise<void> => {
    await ipcClient(IpcRequestWithoutPayload.OpenAppDataDir);
  },
});