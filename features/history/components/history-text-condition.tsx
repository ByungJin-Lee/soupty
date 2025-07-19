import { X } from "react-feather";
import { prompt } from "~/common/stores/prompt-modal-store";

type Props = {
  text?: string;
  onChange(text?: string): void;
};

export const HistoryTextCondition: React.FC<Props> = ({ text, onChange }) => {
  const handlePrompt = async () => {
    const value = await prompt("검색할 단어를 입력하세요.");
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
        {text ? (
          <>
            <span>단어:{text}</span>
            <button className="py-1" onClick={handleReset}>
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <span>단어 필터</span>
          </>
        )}
      </div>
    </>
  );
};
