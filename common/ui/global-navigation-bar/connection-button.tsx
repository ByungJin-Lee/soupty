import { memo, useMemo } from "react";
import { Loader, Pause, Play } from "react-feather";
import { ConnectStatus } from "~/features/soop/stores/channel";

interface ConnectionButtonProps {
  connectStatus: ConnectStatus;
  onClick: () => void;
}

const ConnectionButtonComponent: React.FC<ConnectionButtonProps> = ({
  connectStatus,
  onClick,
}) => {
  const connectionIcon = useMemo(() => {
    switch (connectStatus) {
      case ConnectStatus.CONNECTING:
        return (
          <Loader
            className="w-4 h-4 animate-spin"
            fill="currentColor"
            strokeWidth={1}
          />
        );
      case ConnectStatus.CONNECTED:
        return (
          <Pause className="w-4 h-4" fill="currentColor" strokeWidth={1} />
        );
      case ConnectStatus.DISCONNECTED:
      default:
        return <Play className="w-4 h-4" fill="currentColor" strokeWidth={1} />;
    }
  }, [connectStatus]);

  const isDisabled = connectStatus === ConnectStatus.CONNECTING;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={isDisabled}
      className="p-1.5 rounded-full text-blue-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
      aria-label={
        connectStatus === ConnectStatus.CONNECTED ? "연결 해제" : "연결"
      }
    >
      {connectionIcon}
    </button>
  );
};

ConnectionButtonComponent.displayName = "ConnectionButton";
export const ConnectionButton = memo(ConnectionButtonComponent);
