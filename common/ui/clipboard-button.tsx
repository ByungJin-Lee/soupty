import { Clipboard } from "react-feather";
import toast from "react-hot-toast";

type Props = {
  value: string;
  size?: number;
  message?: string;
  className?: string;
};

export const ClipboardButton: React.FC<Props> = ({
  value,
  size = 16,
  message = "복사가 완료되었습니다.",
  className = "",
}) => {
  const handleClick = () => {
    navigator.clipboard.writeText(value);
    toast.success(message);
  };

  return (
    <button
      className={`inline text-gray-500 cursor-pointer hover:bg-gray-200 p-1 rounded-full ${className}`}
    >
      <Clipboard className="" size={size} onClick={handleClick} />
    </button>
  );
};
