import { prompt } from "~/common/stores/prompt-modal-store";
import { FilterButton } from "~/common/ui";

type Props = {
  text?: string;
  onChange(text?: string): void;
};

export const TextCondition: React.FC<Props> = ({ text, onChange }) => {
  const handlePrompt = async () => {
    const value = await prompt("검색할 단어를 입력하세요.");
    if (value !== null) {
      onChange(value);
    }
  };

  const handleReset = () => {
    onChange();
  };

  return (
    <FilterButton
      value={text}
      placeholder="단어 필터"
      displayValue={text ? `단어:${text}` : undefined}
      onClick={handlePrompt}
      onReset={handleReset}
    />
  );
};
