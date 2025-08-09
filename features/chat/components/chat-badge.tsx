import { Badge } from "~/types/badge";

type Props = {
  badge: Badge;
};

const badgeLabel: Record<Badge, string> = {
  [Badge.BJ]: "B",
  [Badge.Fan]: "F",
  [Badge.Manager]: "M",
  [Badge.Supporter]: "S",
  [Badge.FollowBasic]: "구",
  [Badge.FollowPlus]: "구",
  [Badge.TopFan]: "열",
};

export const ChatBadge: React.FC<Props> = ({ badge }) => {
  return (
    <span
      data-badge-label={badgeLabel[badge]}
      className={`badge inline-block badge-${badge} align-middle w-[20px] h-[20px] ml-[2px]`}
    ></span>
  );
};
