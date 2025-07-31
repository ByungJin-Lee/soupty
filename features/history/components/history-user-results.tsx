import Link from "next/link";
import { Pagination } from "~/common/ui/pagination";
import { route } from "~/constants";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { UserLogEntry } from "~/services/ipc/types";
import { domainEventLabel, DomainEventType } from "~/types";
import { useHistoryUserFilterCtx } from "../context/history-user-filter-context";
import { useHistoryUserSearchContext } from "../context/history-user-search-context";
import { formatTimestamp } from "../utils/format";

type Props = {
  userLog: UserLogEntry;
};

const renderEventPayload = (eventType: DomainEventType, payload: any) => {
  try {
    const parsedPayload = JSON.parse(payload);

    switch (eventType) {
      case DomainEventType.Donation:
        return (
          <div className="space-y-1">
            <div className="font-medium text-yellow-600">
              {parsedPayload.amount}개 후원
            </div>
            {parsedPayload.message && (
              <div className="text-gray-900 break-all">
                &quot;{parsedPayload.message}&quot;
              </div>
            )}
            <div className="text-sm text-gray-600">
              타입: {parsedPayload.donationType}
              {parsedPayload.becomeTopFan && " • 새로운 탑팬!"}
            </div>
          </div>
        );

      case DomainEventType.Subscribe:
        return (
          <div className="space-y-1">
            <div className="font-medium text-purple-600">구독</div>
            <div className="text-sm text-gray-600">
              티어: {parsedPayload.tier} • 갱신: {parsedPayload.renew}개월
            </div>
          </div>
        );

      case DomainEventType.MissionDonation:
        return (
          <div className="space-y-1">
            <div className="font-medium text-blue-600">
              미션 후원 {parsedPayload.amount}개
            </div>
            <div className="text-sm text-gray-600">
              미션 타입: {parsedPayload.missionType}
            </div>
          </div>
        );

      case DomainEventType.Mute:
        return (
          <div className="space-y-1">
            <div className="font-medium text-red-600">
              뮤트됨 ({parsedPayload.seconds}초)
            </div>
            <div className="text-sm text-gray-600">
              실행자: {parsedPayload.by} • 누적: {parsedPayload.counts}회
            </div>
          </div>
        );

      case DomainEventType.Kick:
        return <div className="font-medium text-red-600">킥됨</div>;

      case DomainEventType.Enter:
        return <div className="text-green-600">입장</div>;

      case DomainEventType.Exit:
        return <div className="text-gray-600">퇴장</div>;

      default:
        return <div className="text-gray-900 break-all">{payload}</div>;
    }
  } catch {
    return <div className="text-gray-900 break-all">{payload}</div>;
  }
};

const UserLogItem: React.FC<Props> = ({ userLog }) => {
  const handleClick = useUserPopoverDispatch(userLog.user);

  const renderContent = () => {
    if (userLog.logType === "CHAT") {
      // 채팅 로그 렌더링
      if (userLog.messageType === "EMOTICON" && userLog.metadata?.emoticon) {
        const { id, number, ext, version } = userLog.metadata.emoticon;
        const imageUrl = `https://ogq-sticker-global-cdn-z01.sooplive.co.kr/sticker/${id}/${number}_80.${ext}?ver=${version}`;

        return (
          <div className="flex items-center gap-2 mb-1">
            {userLog.message && (
              <span className="text-gray-900">{userLog.message}</span>
            )}
            <img
              src={imageUrl}
              alt="OGQ 이모티콘"
              className="w-8 h-8"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        );
      }
      return <div className="text-gray-900 mb-1">{userLog.message}</div>;
    } else {
      // 이벤트 로그 렌더링
      return userLog.eventType && userLog.payload
        ? renderEventPayload(userLog.eventType, userLog.payload)
        : <div className="text-gray-500">이벤트</div>;
    }
  };

  const getLogTypeLabel = () => {
    if (userLog.logType === "CHAT") {
      return userLog.messageType === "EMOTICON" ? "이모티콘" : "채팅";
    } else {
      return userLog.eventType ? domainEventLabel[userLog.eventType] : "이벤트";
    }
  };

  const getLogTypeColor = () => {
    if (userLog.logType === "CHAT") {
      return "text-blue-500";
    } else {
      switch (userLog.eventType) {
        case DomainEventType.Donation:
        case DomainEventType.MissionDonation:
          return "text-yellow-600";
        case DomainEventType.Subscribe:
          return "text-purple-600";
        case DomainEventType.Mute:
        case DomainEventType.Kick:
          return "text-red-600";
        case DomainEventType.Enter:
          return "text-green-600";
        default:
          return "text-gray-600";
      }
    }
  };

  return (
    <div className="border-b border-gray-200 p-2 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-medium text-blue-600 cursor-pointer"
              onClick={handleClick}
            >
              {userLog.user.label}
            </span>
            <span className="text-sm text-gray-500">{userLog.channelName}</span>
            <span className="text-xs text-gray-400">
              {formatTimestamp(userLog.timestamp)}
            </span>
          </div>
          {renderContent()}
          <Link
            href={route.broadcastSession(userLog.broadcastId)}
            className="text-xs text-gray-600 underline"
          >
            방송: {userLog.broadcastTitle}
          </Link>
        </div>
        <div className={`text-xs font-medium ml-4 ${getLogTypeColor()}`}>
          {getLogTypeLabel()}
        </div>
      </div>
    </div>
  );
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
        {result.logs.map((userLog) => (
          <UserLogItem key={`${userLog.logType}-${userLog.id}`} userLog={userLog} />
        ))}
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