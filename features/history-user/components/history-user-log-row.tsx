import { formatHHMMSS } from "~/common/utils";
import { ChatMessage } from "~/features/chat";
import { useChatProcessorContext } from "~/features/chat/context/chat-processor";
import { EventDisplayUtil } from "~/features/event/utils/event-display";
import { SimplifiedUserLogEntry } from "~/services/ipc/types";
import { DomainEventType } from "~/types";

// UserLogEntry를 DomainEvent로 변환
const userLogToDomainEvent = (userLog: SimplifiedUserLogEntry) => {
  if (userLog.logType !== "EVENT" || !userLog.eventType) return null;

  return {
    id: userLog.id.toString(),
    type: userLog.eventType as DomainEventType,
    payload:
      typeof userLog.payload === "string"
        ? JSON.parse(userLog.payload)
        : userLog.payload,
  };
};

export const HistoryUserLogRow: React.FC<{
  userLog: SimplifiedUserLogEntry;
}> = ({ userLog }) => {
  const chatProcessor = useChatProcessorContext();

  let content;

  if (userLog.logType === "CHAT") {
    const parts = chatProcessor?.makeParts(
      userLog.message || "",
      userLog.metadata?.emoticon
    );
    content = <ChatMessage parts={parts} className="text-black" />;
  } else {
    const domainEvent = userLogToDomainEvent(userLog);
    content = domainEvent ? (
      EventDisplayUtil.exportSummary(domainEvent)
    ) : (
      <span className="text-gray-500">알 수 없는 이벤트</span>
    );
  }

  return (
    <div className="flex mt-0.5 px-2 py-1 hover:bg-gray-200">
      <span
        title={userLog.timestamp}
        className="text-sm my-auto font-semibold inline-block text-gray-400 mr-1 mt-0.5"
      >
        [{formatHHMMSS(userLog.timestamp)}]
      </span>
      {content}
    </div>
  );
};
