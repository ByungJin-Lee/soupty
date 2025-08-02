import { useState } from "react";
import { User } from "react-feather";
import { FilterButton } from "~/common/ui";
import { ChannelSelectModal } from "~/features/soop/components/channel";
import { ChannelAvatar } from "~/features/soop/components/channel/channel-avatar";
import { Channel } from "~/types";

type Props = {
  channel?: Channel;
  onSelect(channel?: Channel): void;
};

export const ChannelCondition: React.FC<Props> = ({
  channel,
  onSelect,
}) => {
  const [openModal, setOpenModal] = useState(false);

  const handleReset = () => {
    onSelect();
  };

  const prefix = channel ? (
    <ChannelAvatar
      className="rounded-full"
      channel={channel}
      size={24}
    />
  ) : (
    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
      <User className="w-4 h-4 text-gray-500" />
    </div>
  );

  return (
    <>
      <FilterButton
        value={channel?.label}
        placeholder="채널 필터"
        onClick={() => setOpenModal(true)}
        onReset={handleReset}
        prefix={prefix}
      />
      <ChannelSelectModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSelectChannel={onSelect}
      />
    </>
  );
};
