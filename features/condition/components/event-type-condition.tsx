import { useState } from "react";
import { Settings, X } from "react-feather";
import { domainEventLabel, DomainEventType } from "~/types";

const EVENT_TYPE_OPTIONS: { value: DomainEventType; label: string }[] =
  Object.entries(domainEventLabel).map(([value, label]) => ({
    value: value as DomainEventType,
    label,
  }));

type Props = {
  eventType?: DomainEventType;
  onChange(eventType?: DomainEventType): void;
};

export const EventTypeCondition: React.FC<Props> = ({
  eventType,
  onChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange();
  };

  const handleSelect = (type: DomainEventType) => {
    onChange(type);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center py-1.5 px-2 bg-gray-200 rounded-md text-sm gap-2 cursor-pointer"
      >
        {eventType ? (
          <>
            <Settings size={16} className="text-gray-600" />
            <span>{domainEventLabel[eventType]}</span>
            <button className="py-1" onClick={handleReset}>
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-500" />
            </div>
            <span>이벤트 타입</span>
          </>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg w-fit shadow-lg z-10">
          <div className="py-1">
            {EVENT_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
