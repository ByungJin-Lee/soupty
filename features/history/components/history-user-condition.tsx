import { X } from "react-feather";
import { prompt } from "~/common/stores/prompt-modal-store";

type Props = {
  userId?: string;
  onChange(userId?: string): void;
};

export const HistoryUserCondition: React.FC<Props> = ({ userId, onChange }) => {
  const handlePrompt = async () => {
    const value = await prompt("사용자 아이디를 입력하세요.");
    if (value !== null) {
      onChange(value);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange();
  };

  return (
    <>
      <div
        onClick={handlePrompt}
        className="flex items-center py-1.5 px-2 bg-gray-200 rounded-md text-sm gap-2 cursor-pointer"
      >
        {userId ? (
          <>
            <span>유저:{userId}</span>
            <button className="py-1" onClick={handleReset}>
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <span>유저 필터</span>
          </>
        )}
      </div>
    </>
  );
};
