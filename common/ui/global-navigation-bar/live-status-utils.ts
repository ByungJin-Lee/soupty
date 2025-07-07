import { ConnectStatus } from "~/features/soop/stores/channel";

export const getStatusColor = (connectStatus: ConnectStatus): string => {
  switch (connectStatus) {
    case ConnectStatus.CONNECTED:
      return "bg-green-500";
    case ConnectStatus.CONNECTING:
      return "bg-yellow-500";
    case ConnectStatus.DISCONNECTED:
    default:
      return "bg-red-500";
  }
};

export const getStatusText = (connectStatus: ConnectStatus): string => {
  switch (connectStatus) {
    case ConnectStatus.CONNECTED:
      return "연결됨";
    case ConnectStatus.CONNECTING:
      return "연결 중...";
    case ConnectStatus.DISCONNECTED:
    default:
      return "연결 안됨";
  }
};