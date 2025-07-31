import { useState } from "react";
import { Calendar, X } from "react-feather";
import { formatDate } from "~/common/utils";
import { DateTimePicker } from "~/common/ui";

type Props = {
  startDate?: string;
  endDate?: string;
  onStartDateChange(date?: string): void;
  onEndDateChange(date?: string): void;
};

export const PeriodCondition: React.FC<Props> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartDateChange();
    onEndDateChange();
  };

  const getPeriodText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    }
    if (startDate) {
      return `${formatDate(startDate)} ~`;
    }
    if (endDate) {
      return `~ ${formatDate(endDate)}`;
    }
    return "기간 필터링";
  };

  const hasDateSelected = startDate || endDate;

  return (
    <div className="relative">
      <div
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="flex items-center py-1.5 px-2 bg-gray-200 rounded-md text-sm gap-2 cursor-pointer"
      >
        {hasDateSelected ? (
          <>
            <Calendar size={16} className="text-gray-600" />
            <span>{getPeriodText()}</span>
            <button className="py-1" onClick={handleReset}>
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <span>기간 필터링</span>
          </>
        )}
      </div>

      {showDatePicker && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border rounded-lg shadow-lg z-10 min-w-max">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                시작 날짜
              </label>
              <DateTimePicker
                selected={startDate ? new Date(startDate) : null}
                onChange={(date) => onStartDateChange(date?.toISOString())}
                placeholderText="시작 날짜 시간 선택"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                종료 날짜
              </label>
              <DateTimePicker
                selected={endDate ? new Date(endDate) : null}
                onChange={(date) => onEndDateChange(date?.toISOString())}
                placeholderText="종료 날짜 시간 선택"
                minDate={startDate ? new Date(startDate) : undefined}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
