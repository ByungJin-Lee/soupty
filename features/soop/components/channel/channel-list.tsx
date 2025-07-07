import { Channel } from "~/types";
import { ChannelAddButton } from "./channel-add-button";
import { ChannelItem } from "./channel-item";

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
}) => {
  return (
    <div className="grid grid-cols-2 gap-1.5 max-h-64 pb-2 overflow-y-scroll invisible-scrollbar inset-shadow-bottom">
      {channels.map((channel) => (
        <ChannelItem
          key={channel.id}
          channel={channel}
          isSelected={selectedChannel?.id === channel.id}
          onSelect={onSelectChannel}
        />
      ))}
      <ChannelAddButton />
    </div>
  );
};
