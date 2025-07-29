import { useState } from "react";
import { User, X } from "react-feather";
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

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <>
      <div
        onClick={() => setOpenModal(true)}
        className="flex items-center py-1.5 px-2 bg-gray-200 rounded-md text-sm gap-2 cursor-pointer"
      >
        {channel ? (
          <>
            <ChannelAvatar
              className="rounded-full"
              channel={channel}
              size={24}
            />
            <span>{channel.label}</span>
            <button className="py-1" onClick={handleReset}>
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <span>채널 필터</span>
          </>
        )}
      </div>
      <ChannelSelectModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSelectChannel={onSelect}
      />
    </>
  );
};
