import { useState } from "react";
import { MessageCircle, X } from "react-feather";

type ChatType = "TEXT" | "EMOTICON" | "STICKER";

const CHAT_TYPE_OPTIONS: { value: ChatType; label: string }[] = [
  { value: "TEXT", label: "텍스트" },
  { value: "EMOTICON", label: "OGQ" },
  // { value: "STICKER", label: "스티커" },
];

type Props = {
  chatType?: string;
  onChange(chatType?: string): void;
};

export const ChatTypeCondition: React.FC<Props> = ({ chatType, onChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange();
  };

  const handleSelect = (type: ChatType) => {
    onChange(type);
    setShowDropdown(false);
  };

  const getDisplayText = () => {
    const option = CHAT_TYPE_OPTIONS.find((opt) => opt.value === chatType);
    return option ? option.label : "채팅 타입";
  };

  return (
    <div className="relative">
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center py-1.5 px-2 bg-gray-200 rounded-md text-sm gap-2 cursor-pointer"
      >
        {chatType ? (
          <>
            <MessageCircle size={16} className="text-gray-600" />
            <span>{getDisplayText()}</span>
            <button className="py-1" onClick={handleReset}>
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-gray-500" />
            </div>
            <span>채팅 타입</span>
          </>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg border-gray-400/40 shadow-lg z-10 min-w-max">
          <div className="py-1">
            {CHAT_TYPE_OPTIONS.map((option) => (
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
