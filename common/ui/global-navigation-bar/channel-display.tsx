import { memo } from "react";
import { User } from "react-feather";
import { ChannelAvatar } from "~/features/soop/components/channel/channel-avatar";
import { Channel } from "~/types";
import { ConnectStatus } from "~/features/soop/stores/channel";
import { StatusIndicator } from "./status-indicator";
import { getStatusText } from "./live-status-utils";

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
      className="flex items-center gap-3 p-1 bg-gray-50 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer flex-1"
      onClick={onClick}
    >
      <div className="relative">
        {channel ? (
          <ChannelAvatar
            channel={channel}
            size={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <StatusIndicator connectStatus={connectStatus} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {channel ? channel.label : "채널 선택"}
        </div>
        <div className="text-xs text-gray-500">
          {getStatusText(connectStatus)}
        </div>
      </div>
    </div>
  );
};

ChannelDisplayComponent.displayName = 'ChannelDisplay';
export const ChannelDisplay = memo(ChannelDisplayComponent);