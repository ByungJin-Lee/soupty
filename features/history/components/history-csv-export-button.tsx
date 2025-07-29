import { Download } from "react-feather";
import { toast } from "react-hot-toast";
import { exportEventsToCsv } from "~/common/utils/csv-export";
import {
  validateChatFiltersForCsvExport,
  validateEventFiltersForCsvExport,
} from "~/common/utils/csv-export-validation";
import { ChatSearchFilters, EventSearchFilters } from "~/services/ipc/types";

interface ChatCsvExportButtonProps {
  filters: ChatSearchFilters;
}

interface EventCsvExportButtonProps {
  filters: EventSearchFilters;
}

export const ChatCsvExportButton: React.FC<ChatCsvExportButtonProps> = ({
  filters,
}) => {
  const handleExport = async () => {
    const validation = validateChatFiltersForCsvExport(filters);

    if (!validation.isValid) {
      toast.error(validation.error || "CSV 내보내기 조건을 확인해주세요.");
      return;
    }

    // 날짜 형식 변환 및 검증
    let startDate: string | undefined;
    let endDate: string | undefined;

    try {
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (isNaN(start.getTime())) {
          throw new Error(`잘못된 날짜 형식: ${filters.startDate}`);
        }
        startDate = start.toISOString();
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        if (isNaN(end.getTime())) {
          throw new Error(`잘못된 날짜 형식: ${filters.endDate}`);
        }
        endDate = end.toISOString();
      }
    } catch (error) {
      toast.error(
        `날짜 형식 오류: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
      return;
    }

    await exportEventsToCsv({
      eventType: "Chat",
      channelId: validation.channelId,
      broadcastId: validation.broadcastId,
      startDate: startDate,
      endDate: endDate,
      defaultFileName: `chat_export_${
        validation.channelId ? validation.channelId : validation.broadcastId
      }.csv`,
    });
  };

  return (
    <button
      onClick={handleExport}
      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1"
      title="CSV로 내보내기"
    >
      <Download size={16} />
      <span>CSV</span>
    </button>
  );
};

export const EventCsvExportButton: React.FC<EventCsvExportButtonProps> = ({
  filters,
}) => {
  const handleExport = async () => {
    const validation = validateEventFiltersForCsvExport(filters);

    if (!validation.isValid) {
      toast.error(validation.error || "CSV 내보내기 조건을 확인해주세요.");
      return;
    }

    // 날짜 형식 변환 및 검증
    let startDate: string | undefined;
    let endDate: string | undefined;

    try {
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (isNaN(start.getTime())) {
          throw new Error(`Invalid start date: ${filters.startDate}`);
        }
        startDate = start.toISOString();
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        if (isNaN(end.getTime())) {
          throw new Error(`Invalid end date: ${filters.endDate}`);
        }
        endDate = end.toISOString();
      }
    } catch (error) {
      toast.error(
        `날짜 형식 오류: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
      return;
    }

    await exportEventsToCsv({
      eventType: filters.eventType!,
      channelId: validation.channelId,
      broadcastId: validation.broadcastId,
      startDate: startDate,
      endDate: endDate,
      defaultFileName: `${filters.eventType}_export_${
        validation.channelId ? validation.channelId : validation.broadcastId
      }.csv`,
    });
  };

  return (
    <button
      onClick={handleExport}
      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1"
      title="CSV로 내보내기"
    >
      <Download size={16} />
      <span>CSV</span>
    </button>
  );
};
