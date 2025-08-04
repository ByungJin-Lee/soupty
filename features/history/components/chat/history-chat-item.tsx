import { openBroadcastSession } from "~/features/broadcast/utils/opener";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { ChatLogResult } from "~/services/ipc/types";
import { formatYYYYMMDDHHMMSS } from "../../utils/format";
import { HistoryChatContent } from "./history-chat-content";

type Props = {
  chatLog: ChatLogResult;
};

export const HistoryChatItem: React.FC<Props> = ({ chatLog }) => {
  const handleClick = useUserPopoverDispatch(chatLog.user);

  return (
    <>
      <div>
        <span
          className="font-medium text-blue-600 cursor-pointer hover:underline"
          onClick={handleClick}
        >
          {chatLog.user.label}
        </span>
      </div>
      <div className="text-gray-600">
        {formatYYYYMMDDHHMMSS(chatLog.timestamp)}
      </div>
      <div>
        <HistoryChatContent chatLog={chatLog} />
      </div>
      <div className="text-gray-600 text-center">{chatLog.channelName}</div>
      <div className="overflow-hidden text-ellipsis min-w-0">
        <button
          onClick={() => openBroadcastSession(chatLog.broadcastId)}
          className="text-blue-600 hover:underline text-nowrap"
        >
          {chatLog.broadcastTitle}
        </button>
      </div>
    </>
  );
};
