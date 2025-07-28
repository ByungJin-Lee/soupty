import { Download } from "react-feather";
import { toast } from "react-hot-toast";
import { exportEventsToCsv } from "~/common/utils/csv-export";
import { validateChatFiltersForCsvExport, validateEventFiltersForCsvExport } from "~/common/utils/csv-export-validation";
import { ChatSearchFilters, EventSearchFilters } from "~/services/ipc/types";

interface ChatCsvExportButtonProps {
  filters: ChatSearchFilters;
}

interface EventCsvExportButtonProps {
  filters: EventSearchFilters;
}

export const ChatCsvExportButton: React.FC<ChatCsvExportButtonProps> = ({ filters }) => {
  const handleExport = async () => {
    const validation = validateChatFiltersForCsvExport(filters);
    
    if (!validation.isValid) {
      toast.error(validation.error || 'CSV 내보내기 조건을 확인해주세요.');
      return;
    }

    console.log('Chat CSV Export - Original filters:', filters);
    
    // 날짜 형식 변환 및 검증
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    try {
      if (filters.startDate) {
        // ISO 8601 형식으로 변환
        const start = new Date(filters.startDate);
        if (isNaN(start.getTime())) {
          throw new Error(`Invalid start date: ${filters.startDate}`);
        }
        startDate = start.toISOString();
        console.log(`Start date converted: ${filters.startDate} -> ${startDate}`);
      }
      
      if (filters.endDate) {
        // ISO 8601 형식으로 변환
        const end = new Date(filters.endDate);
        if (isNaN(end.getTime())) {
          throw new Error(`Invalid end date: ${filters.endDate}`);
        }
        endDate = end.toISOString();
        console.log(`End date converted: ${filters.endDate} -> ${endDate}`);
      }
    } catch (error) {
      console.error('Date conversion error:', error);
      toast.error(`날짜 형식 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      return;
    }

    await exportEventsToCsv({
      eventType: 'Chat',
      channelId: validation.channelId || null,
      broadcastId: validation.broadcastId || null,
      startDate: startDate || null,
      endDate: endDate || null,
      defaultFileName: `chat_export_${new Date().toISOString().split('T')[0]}.csv`,
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

export const EventCsvExportButton: React.FC<EventCsvExportButtonProps> = ({ filters }) => {
  const handleExport = async () => {
    const validation = validateEventFiltersForCsvExport(filters);
    
    if (!validation.isValid) {
      toast.error(validation.error || 'CSV 내보내기 조건을 확인해주세요.');
      return;
    }

    console.log('Event CSV Export - Original filters:', filters);
    
    // 날짜 형식 변환 및 검증
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    try {
      if (filters.startDate) {
        // ISO 8601 형식으로 변환
        const start = new Date(filters.startDate);
        if (isNaN(start.getTime())) {
          throw new Error(`Invalid start date: ${filters.startDate}`);
        }
        startDate = start.toISOString();
        console.log(`Start date converted: ${filters.startDate} -> ${startDate}`);
      }
      
      if (filters.endDate) {
        // ISO 8601 형식으로 변환
        const end = new Date(filters.endDate);
        if (isNaN(end.getTime())) {
          throw new Error(`Invalid end date: ${filters.endDate}`);
        }
        endDate = end.toISOString();
        console.log(`End date converted: ${filters.endDate} -> ${endDate}`);
      }
    } catch (error) {
      console.error('Date conversion error:', error);
      toast.error(`날짜 형식 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      return;
    }

    await exportEventsToCsv({
      eventType: filters.eventType!,
      channelId: validation.channelId || null,
      broadcastId: validation.broadcastId || null,
      startDate: startDate || null,
      endDate: endDate || null,
      defaultFileName: `${filters.eventType}_export_${new Date().toISOString().split('T')[0]}.csv`,
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