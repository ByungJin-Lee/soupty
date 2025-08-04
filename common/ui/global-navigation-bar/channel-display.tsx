import { memo } from "react";
import { User } from "react-feather";
import { ChannelAvatar } from "~/features/soop/components/channel/channel-avatar";
import { ConnectStatus } from "~/features/soop/stores/channel";
import { Channel } from "~/types";
import { StatusIndicator } from "./status-indicator";

interface ChannelDisplayProps {
  channel: Channel | null;
  connectStatus: ConnectStatus;
  onClick: () => void;
}

const ChannelDisplayComponent: React.FC<ChannelDisplayProps> = ({
  channel,
  connectStatus,
  onClick,
}) => {
  return (
    <div
      className="flex w-[90px] sm:w-[110px] items-center h-8 gap-3 px-2 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer flex-1 bg-gradient-accent"
      onClick={onClick}
      role="button"
    >
      <div className="relative ">
        {channel ? (
          <ChannelAvatar channel={channel} size={24} className="rounded-full" />
        ) : (
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <StatusIndicator connectStatus={connectStatus} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs text-white truncate">
          {channel ? channel.label : "채널 선택"}
        </div>
      </div>
    </div>
  );
};

ChannelDisplayComponent.displayName = "ChannelDisplay";
export const ChannelDisplay = memo(ChannelDisplayComponent);
