import { prompt } from "~/common/stores/prompt-modal-store";
import { FilterButton } from "~/common/ui";

type Props = {
  username?: string;
  onChange(userId?: string): void;
};

export const UsernameCondition: React.FC<Props> = ({
  username,
  onChange,
}) => {
  const handlePrompt = async () => {
    const value = await prompt("사용자 이름를 입력하세요.");
    if (value !== null) {
      onChange(value);
    }
  };

  const handleReset = () => {
    onChange();
  };

  return (
    <FilterButton
      value={username}
      placeholder="유저 이름 필터"
      displayValue={username ? `유저이름:${username}` : undefined}
      onClick={handlePrompt}
      onReset={handleReset}
    />
  );
};
