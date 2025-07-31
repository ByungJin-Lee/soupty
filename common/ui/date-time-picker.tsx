"use client";

import { ko } from "date-fns/locale";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("ko", ko);

type DateTimePickerProps = {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
  isClearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  dateFormat?: string;
  disabled?: boolean;
};

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selected,
  onChange,
  placeholderText,
  className = "p-2 border rounded-md text-sm",
  isClearable = true,
  minDate,
  maxDate,
  showTimeSelect = true,
  timeFormat = "HH:mm:ss",
  timeIntervals = 1,
  dateFormat = "yyyy-MM-dd HH:mm:ss",
  disabled = false,
}) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect={showTimeSelect}
      timeFormat={timeFormat}
      timeIntervals={timeIntervals}
      dateFormat={dateFormat}
      placeholderText={placeholderText}
      className={className}
      isClearable={isClearable}
      minDate={minDate}
      maxDate={maxDate}
      locale="ko"
      disabled={disabled}
    />
  );
};
