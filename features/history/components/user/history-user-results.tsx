import { Pagination } from "~/common/ui/pagination";
import { openBroadcastSession } from "~/features/broadcast/utils/opener";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import {
  ChatLogMessageType,
  ChatLogResult,
  EventLogResult,
  UserLogEntry,
} from "~/services/ipc/types";
import { useHistoryUserFilterCtx } from "../../context/history-user-filter-context";
import { useHistoryUserSearchContext } from "../../context/history-user-search-context";
import { formatYYYYMMDDHHMMSS } from "../../utils/format";
import { HistoryChatContent } from "../chat/history-chat-content";
import { HistoryEventItem } from "../event/history-event-item";

// UserLogEntry를 ChatLogResult로 변환
const userLogToChatLog = (userLog: UserLogEntry): ChatLogResult => ({
  id: userLog.id,
  broadcastId: userLog.broadcastId,
  user: userLog.user,
  messageType:
    (userLog.messageType as ChatLogMessageType) || ChatLogMessageType.Text,
  message: userLog.message || "",
  metadata: userLog.metadata,
  timestamp: userLog.timestamp,
  channelId: userLog.channelId,
  channelName: userLog.channelName,
  broadcastTitle: userLog.broadcastTitle,
});

// UserLogEntry를 EventLogResult로 변환
const userLogToEventLog = (userLog: UserLogEntry): EventLogResult => ({
  id: userLog.id,
  broadcastId: userLog.broadcastId,
  userId: userLog.user.id,
  username: userLog.user.label,
  eventType: userLog.eventType!,
  payload: userLog.payload ? JSON.parse(userLog.payload) : {},
  timestamp: userLog.timestamp,
  channelId: userLog.channelId,
  channelName: userLog.channelName,
  broadcastTitle: userLog.broadcastTitle,
});

// 채팅 로그를 이벤트 테이블 형태로 표시하는 컴포넌트
const UserChatLogItem: React.FC<{ userLog: UserLogEntry }> = ({ userLog }) => {
  const handleClick = useUserPopoverDispatch(userLog.user, {
    channelId: userLog.channelId,
  });
  const chatLog = userLogToChatLog(userLog);

  return (
    <>
      <div>
        <span
          className="font-medium text-blue-600 cursor-pointer hover:underline"
          onClick={handleClick}
        >
          {userLog.user.label}
        </span>
      </div>
      <div className="text-gray-600">
        {formatYYYYMMDDHHMMSS(userLog.timestamp)}
      </div>
      <div className="text-md text-center text-blue-500">채팅</div>
      <div>
        <HistoryChatContent chatLog={chatLog} />
      </div>
      <div className="text-gray-600 text-center">{userLog.channelName}</div>
      <div className="overflow-hidden text-ellipsis min-w-0">
        <button
          onClick={() => openBroadcastSession(userLog.broadcastId)}
          className="text-blue-600 hover:underline text-nowrap"
        >
          {userLog.broadcastTitle}
        </button>
      </div>
    </>
  );
};

type Props = {
  userLog: UserLogEntry;
};

const UserLogItem: React.FC<Props> = ({ userLog }) => {
  if (userLog.logType === "CHAT") {
    return <UserChatLogItem userLog={userLog} />;
  } else {
    return <HistoryEventItem eventLog={userLogToEventLog(userLog)} />;
  }
};

export const HistoryUserResults: React.FC = () => {
  const { result, search } = useHistoryUserSearchContext();
  const filters = useHistoryUserFilterCtx();

  const handlePageChange = (page: number, pageSize: number) => {
    if (filters) {
      search(filters, { page, pageSize });
    }
  };

  if (!result) {
    return (
      <div className="p-8 text-center text-gray-500">
        사용자 ID를 입력하고 검색을 시작하세요.
      </div>
    );
  }

  if (result.logs.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">검색 결과가 없습니다.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="user-log-table-grid sticky top-0 bg-gray-100 border-b border-gray-300 text-sm font-medium text-gray-700 text-center">
          <div>이름</div>
          <div>시각</div>
          <div>이벤트 타입</div>
          <div>내용</div>
          <div>채널</div>
          <div>세션</div>
        </div>
        <div className="user-log-table-grid">
          {result.logs.map((userLog) => (
            <UserLogItem
              key={`${userLog.logType}-${userLog.id}`}
              userLog={userLog}
            />
          ))}
        </div>
      </div>
      <Pagination
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageChange}
      />
    </div>
  );
};
