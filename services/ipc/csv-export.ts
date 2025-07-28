import { ipcClient } from "./base";
import { IpcRequestWithoutPayload, IpcRequestWithPayload, CsvExportOptions, validateCsvExportOptions } from "./types";

/**
 * @description CSV Export 관련 IPC 요청을 처리하는 객체입니다.
 */
export const csvExport = Object.freeze({
  /**
   * 지원하는 이벤트 타입 목록을 가져옵니다
   */
  async getSupportedEventTypes(): Promise<string[]> {
    return ipcClient(IpcRequestWithoutPayload.GetSupportedEventTypes);
  },

  /**
   * 이벤트를 CSV로 내보냅니다
   */
  async exportEventsToCsv(options: CsvExportOptions): Promise<string> {
    // 프론트엔드에서 먼저 검증
    const validationError = validateCsvExportOptions(options);
    if (validationError) {
      throw new Error(validationError);
    }
    
    // undefined를 null로 변환 (JSON 직렬화 호환성)
    const serializedOptions = {
      ...options,
      startDate: options.startDate === undefined ? null : options.startDate,
      endDate: options.endDate === undefined ? null : options.endDate,
      channelId: options.channelId === undefined ? null : options.channelId,
      broadcastId: options.broadcastId === undefined ? null : options.broadcastId,
    };
    
    console.log("CSV Export: Calling IPC with serialized options:", serializedOptions);
    return ipcClient(IpcRequestWithPayload.ExportEventsToCsv, { options: serializedOptions });
  },
});