import { prompt } from "~/common/stores/prompt-modal-store";
import { FilterButton } from "~/common/ui";

type Props = {
  userId?: string;
  onChange(userId?: string): void;
};

export const UserCondition: React.FC<Props> = ({ userId, onChange }) => {
  const handlePrompt = async () => {
    const value = await prompt("사용자 아이디를 입력하세요.");
    if (value !== null) {
      onChange(value);
    }
  };

  const handleReset = () => {
    onChange();
  };

  return (
    <FilterButton
      value={userId}
      placeholder="유저 필터"
      displayValue={userId ? `유저:${userId}` : undefined}
      onClick={handlePrompt}
      onReset={handleReset}
    />
  );
};
