import { Clipboard } from "react-feather";

type Props = {
  value: string;
  size?: number;
};

export const ClipboardButton: React.FC<Props> = ({ value, size = 16 }) => {
  const handleClick = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <button className="inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full">
      <Clipboard className="inline" size={size} onClick={handleClick} />
    </button>
  );
};
