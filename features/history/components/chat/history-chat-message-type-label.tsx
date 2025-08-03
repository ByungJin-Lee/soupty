import { ChatLogMessageType } from "~/services/ipc/types";

interface HistoryChatMessageTypeLabelProps {
  messageType: ChatLogMessageType;
  className?: string;
}

const messageTypeLabel: Record<ChatLogMessageType, string> = {
  [ChatLogMessageType.Text]: "텍스트",
  [ChatLogMessageType.Emotion]: "이모티콘",
  [ChatLogMessageType.Sticker]: "스티커",
};

export const HistoryChatMessageTypeLabel: React.FC<
  HistoryChatMessageTypeLabelProps
> = ({ messageType, className = "text-xs text-gray-400" }) => {
  return <div className={className}>{messageTypeLabel[messageType]}</div>;
};
