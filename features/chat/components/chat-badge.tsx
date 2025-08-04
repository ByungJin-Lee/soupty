import { Badge } from "~/types/badge";

type Props = {
  badge: Badge;
};

export const ChatBadge: React.FC<Props> = ({ badge }) => {
  return (
    <span
      className={`inline-block badge-${badge} align-middle w-[20px] h-[20px] ml-[2px]`}
    ></span>
  );
};
