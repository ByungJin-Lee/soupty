import { useState } from "react";
import { Channel } from "~/types";
import { useChannels } from "../../hooks/channels";
import { ChannelActions } from "./channel-actions";
import { ChannelList } from "./channel-list";
import { EmptyState } from "./channel-states";

interface ChannelContentProps {
  onClose: () => void;
  onSelectChannel?: (channel: Channel) => void;
}

const ChannelContent: React.FC<ChannelContentProps> = ({ onClose, onSelectChannel }) => {
  const { data: channels } = useChannels();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    onSelectChannel?.(channel);
  };

  const handleConfirm = () => {
    if (selectedChannel) {
      onSelectChannel?.(selectedChannel);
      onClose();
    }
  };

  if (!channels || channels.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <ChannelList
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={handleSelectChannel}
      />
      <ChannelActions
        onCancel={onClose}
        onConfirm={handleConfirm}
        disabled={!selectedChannel}
      />
    </>
  );
};

export default ChannelContent;