import { ChatSearchFilters, EventSearchFilters } from '~/services/ipc/types';

export interface CsvExportValidationResult {
  isValid: boolean;
  error?: string;
  channelId?: string;
  broadcastId?: number;
}

/**
 * Chat 필터에서 CSV export 조건을 검증합니다
 */
export function validateChatFiltersForCsvExport(filters: ChatSearchFilters): CsvExportValidationResult {
  // broadcastId나 channelId 중 하나는 반드시 있어야 함
  if (!filters.broadcastId && !filters.channelId) {
    return {
      isValid: false,
      error: 'CSV 내보내기를 위해서는 방송 세션 또는 채널을 선택해야 합니다.',
    };
  }

  return {
    isValid: true,
    channelId: filters.channelId,
    broadcastId: filters.broadcastId,
  };
}

/**
 * Event 필터에서 CSV export 조건을 검증합니다
 */
export function validateEventFiltersForCsvExport(filters: EventSearchFilters): CsvExportValidationResult {
  // broadcastId나 channelId 중 하나는 반드시 있어야 함
  if (!filters.broadcastId && !filters.channelId) {
    return {
      isValid: false,
      error: 'CSV 내보내기를 위해서는 방송 세션 또는 채널을 선택해야 합니다.',
    };
  }

  // 이벤트 타입이 지정되지 않은 경우
  if (!filters.eventType) {
    return {
      isValid: false,
      error: 'CSV 내보내기를 위해서는 이벤트 타입을 선택해야 합니다.',
    };
  }

  return {
    isValid: true,
    channelId: filters.channelId,
    broadcastId: filters.broadcastId,
  };
}