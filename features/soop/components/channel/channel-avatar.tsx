import { formatChannelImage } from "~/common/utils/format";
import { Channel } from "~/types";

interface ChannelAvatarProps {
  channel: Omit<Channel, "label">;
  size: number | string;
  className?: string;
}

export const ChannelAvatar: React.FC<ChannelAvatarProps> = ({
  channel,
  size,
  className = "",
}) => {
  return (
    <img
      src={formatChannelImage(channel.id)}
      alt={channel.id}
      className={`block aspect-square ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
