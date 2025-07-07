"use client";

import { ChannelSelectModal } from "~/features/soop/components/channel/channel-select-modal";
import { ChannelDisplay } from "./channel-display";
import { ConnectionButton } from "./connection-button";
import { useLiveStatus } from "./live-status.hook";

export const LiveStatus = () => {
  const {
    channel,
    connectStatus,
    isModalOpen,
    handleChannelSelect,
    handleOpenModal,
    handleCloseModal,
    handleToggleConnection,
  } = useLiveStatus();

  return (
    <>
      <div className="flex items-center gap-2">
        <ChannelDisplay
          channel={channel}
          connectStatus={connectStatus}
          onClick={handleOpenModal}
        />
        <ConnectionButton
          connectStatus={connectStatus}
          onClick={handleToggleConnection}
        />
      </div>

      <ChannelSelectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectChannel={handleChannelSelect}
      />
    </>
  );
};
