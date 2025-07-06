import { formatChannelImage } from "~/common/utils/format";
import { Channel } from "~/types";

interface ChannelAvatarProps {
  channel: Channel;
  size: number;
  className?: string;
}

export const ChannelAvatar: React.FC<ChannelAvatarProps> = ({
  channel,
  size,
  className = "",
}) => {
  return (
    <img
      src={formatChannelImage(channel)}
      alt={channel.id}
      className={`block aspect-square ${className}`}
      style={{ width: size, height: size }}
    />
  );
};