import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ConnectStatus, useChannel } from "~/features/soop/stores/channel";
import { Channel } from "~/types";

export const useLiveStatus = () => {
  // Optimize selectors to prevent unnecessary re-renders
  const channel = useChannel((state) => state.channel);
  const connectStatus = useChannel((state) => state.connectStatus);
  const connect = useChannel((state) => state.connect);
  const disconnect = useChannel((state) => state.disconnect);
  const setChannel = useChannel((state) => state.setChannel);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize derived values
  const canChangeChannel = useMemo(
    () => connectStatus === ConnectStatus.DISCONNECTED,
    [connectStatus]
  );

  const canConnect = useMemo(
    () => connectStatus === ConnectStatus.DISCONNECTED && channel !== null,
    [connectStatus, channel]
  );

  const handleChannelSelect = useCallback(
    (selectedChannel: Channel) => {
      setChannel(selectedChannel);
      setIsModalOpen(false);
    },
    [setChannel]
  );

  const handleOpenModal = useCallback(() => {
    // 연결 도중에는 변경할 수 없음
    if (canChangeChannel) {
      setIsModalOpen(true);
    }
  }, [canChangeChannel]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleToggleConnection = useCallback(async () => {
    try {
      if (!channel) {
        setIsModalOpen(true);
        return;
      }

      if (connectStatus === ConnectStatus.CONNECTED) {
        await disconnect();
      } else if (canConnect) {
        await connect(channel);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [channel, connectStatus, connect, disconnect, canConnect]);

  return {
    // State
    channel,
    connectStatus,
    isModalOpen,
    canChangeChannel,
    canConnect,

    // Handlers
    handleChannelSelect,
    handleOpenModal,
    handleCloseModal,
    handleToggleConnection,
  };
};
