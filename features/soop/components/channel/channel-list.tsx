import { Channel } from "~/types";
import { ChannelItem } from "./channel-item";
import { ChannelAddButton } from "./channel-add-button";

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
    <div className="grid grid-cols-2 gap-1.5  max-h-64  overflow-y-scroll invisible-scrollbar">
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
