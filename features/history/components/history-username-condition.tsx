import { X } from "react-feather";
import { prompt } from "~/common/stores/prompt-modal-store";

type Props = {
  username?: string;
  onChange(userId?: string): void;
};

export const HistoryUsernameCondition: React.FC<Props> = ({
  username,
  onChange,
}) => {
  const handlePrompt = async () => {
    const value = await prompt("사용자 이름를 입력하세요.");
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
        {username ? (
          <>
            <span>유저이름:{username}</span>
            <button className="py-1" onClick={handleReset}>
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <span>유저 이름 필터</span>
          </>
        )}
      </div>
    </>
  );
};
