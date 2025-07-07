import { memo } from "react";
import { ConnectStatus } from "~/features/soop/stores/channel";
import { getStatusColor } from "./live-status-utils";

interface StatusIndicatorProps {
  connectStatus: ConnectStatus;
}

const StatusIndicatorComponent: React.FC<StatusIndicatorProps> = ({
  connectStatus,
}) => {
  return (
    <div
      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
        connectStatus
      )}`}
    />
  );
};

StatusIndicatorComponent.displayName = 'StatusIndicator';
export const StatusIndicator = memo(StatusIndicatorComponent);