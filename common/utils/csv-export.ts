import { save } from "@tauri-apps/plugin-dialog";
import { toast } from "react-hot-toast";
import { ipcService } from "~/services/ipc";
import { CsvExportOptions } from "~/services/ipc/types";

export interface CsvExportParams {
  eventType: string;
  startDate?: string;
  endDate?: string;
  channelId?: string;
  broadcastId?: number;
  defaultFileName?: string;
}

/**
 * CSV 내보내기를 위한 파일 경로 선택 및 내보내기 실행
 */
export async function exportEventsToCsv(
  params: CsvExportParams
): Promise<void> {
  try {
    // 1. 파일 저장 경로 선택
    const filePath = await save({
      filters: [
        {
          name: "CSV Files",
          extensions: ["csv"],
        },
      ],
      defaultPath: params.defaultFileName || `${params.eventType}_export.csv`,
    });

    // 사용자가 취소한 경우
    if (!filePath) {
      return;
    }

    // 2. CSV 내보내기 옵션 준비
    const exportOptions: CsvExportOptions = {
      eventType: params.eventType,
      startDate: params.startDate && new Date(params.startDate).toISOString(),
      endDate: params.endDate && new Date(params.endDate).toISOString(),
      channelId: params.channelId,
      broadcastId: params.broadcastId,
      outputPath: filePath,
    };

    // 3. 내보내기 실행
    toast.loading("CSV 파일을 내보내는 중...", { id: "csv-export" });

    const resultPath = await ipcService.csvExport.exportEventsToCsv(
      exportOptions
    );

    toast.success(`CSV 파일이 저장되었습니다: ${resultPath}`, {
      id: "csv-export",
      duration: 5000,
    });
  } catch (error) {
    toast.error(
      `CSV 내보내기 실패: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`,
      {
        id: "csv-export",
        duration: 5000,
      }
    );
  }
}

/**
 * 지원하는 이벤트 타입 목록 가져오기
 */
export async function getSupportedEventTypes(): Promise<string[]> {
  try {
    return await ipcService.csvExport.getSupportedEventTypes();
  } catch (error) {
    console.error("Failed to get supported event types:", error);
    toast.error("지원하는 이벤트 타입을 가져오는데 실패했습니다.");
    return [];
  }
}
