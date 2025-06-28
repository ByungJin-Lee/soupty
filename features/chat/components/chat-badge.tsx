import { Badge } from "~/types/badge";

type Props = {
  badge: Badge;
};

export const ChatBadge: React.FC<Props> = ({ badge }) => {
  return (
    <span
      className={`inline-block text-center badge-${badge} min-w-[20px] max-w-[20px] min-h-[20px] max-h-[20px] ml-[2px]`}
    ></span>
  );
};
