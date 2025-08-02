import Link from "next/link";
import { Pagination } from "~/common/ui/pagination";
import { route } from "~/constants";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { EventLogResult } from "~/services/ipc/types";
import {
  domainEventLabel,
  DomainEventType,
  DonationType,
  donationTypeLabel,
} from "~/types";
import { useHistoryEventFilterCtx } from "../context/history-event-filter-context";
import { useHistoryEventSearchContext } from "../context/history-event-search-context";
import { formatTimestamp } from "../utils/format";

type Props = {
  eventLog: EventLogResult;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderEventPayload = (eventType: DomainEventType, payload: any) => {
  try {
    switch (eventType) {
      case DomainEventType.Chat:
        // 해당 이벤트는 chat log에서 핸들링 됩니다.
        return null;

      case DomainEventType.Donation:
        return (
          <div className="space-y-1">
            <div className="font-medium text-yellow-600">
              {payload.amount}개 후원
            </div>
            {payload.message && (
              <div className="text-gray-900 break-all">
                &quot;{payload.message}&quot;
              </div>
            )}
            <div className="text-sm text-gray-600">
              타입: {donationTypeLabel[payload.donationType as DonationType]}
              {payload.becomeTopFan && " • 새로운 탑팬!"}
            </div>
          </div>
        );

      case DomainEventType.Subscribe:
        return (
          <div className="space-y-1">
            <div className="font-medium text-purple-600">구독</div>
            <div className="text-sm text-gray-600">
              티어: {payload.tier} • 갱신: {payload.renew}개월
            </div>
          </div>
        );

      case DomainEventType.MissionDonation:
        return (
          <div className="space-y-1">
            <div className="font-medium text-blue-600">
              미션 후원 {payload.amount}개
            </div>
            <div className="text-sm text-gray-600">
              미션 타입: {payload.missionType}
            </div>
          </div>
        );

      case DomainEventType.MissionTotal:
        return (
          <div className="font-medium text-blue-600">
            미션 총합: {payload.amount}개 ({payload.missionType})
          </div>
        );

      case DomainEventType.ChallengeMissionResult:
        return (
          <div className="space-y-1">
            <div
              className={`font-medium ${
                payload.isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              챌린지 미션 {payload.isSuccess ? "성공" : "실패"}
            </div>
            <div className="text-gray-900">{payload.title}</div>
          </div>
        );

      case DomainEventType.BattleMissionResult:
        return (
          <div className="space-y-1">
            <div className="font-medium text-orange-600">
              배틀 미션 결과:{" "}
              {payload.isDraw ? "무승부" : `${payload.winner} 승리`}
            </div>
            <div className="text-gray-900">{payload.title}</div>
          </div>
        );

      case DomainEventType.Mute:
        return (
          <div className="space-y-1">
            <div className="font-medium text-red-600">
              채팅금지 ({payload.seconds}초)
            </div>
            <div className="text-sm text-gray-600">
              실행자: {payload.by} • 누적: {payload.counts}회
            </div>
          </div>
        );

      case DomainEventType.Kick:
        return <div className="font-medium text-red-600">강제퇴장</div>;

      case DomainEventType.KickCancel:
        return (
          <div className="font-medium text-green-600">
            강제퇴장이 취소됨 (사용자 ID: {payload.userId})
          </div>
        );

      case DomainEventType.Black:
        return (
          <div className="font-medium text-black">
            사용자가 블랙리스트에 추가됨 (ID: {payload.userId})
          </div>
        );

      case DomainEventType.Freeze:
        return (
          <div className="space-y-1">
            <div className="font-medium text-blue-600">
              채팅 제한 {payload.freezed ? "활성화" : "비활성화"}
            </div>
            <div className="text-sm text-gray-600">
              구독 {payload.limitSubscriptionMonth}개월 이상 • 풍선{" "}
              {payload.limitBalloons}개 이상
            </div>
            {payload.targets?.length > 0 && (
              <div className="text-sm text-gray-600">
                대상: {payload.targets.join(", ")}
              </div>
            )}
          </div>
        );

      case DomainEventType.Slow:
        return (
          <div className="font-medium text-blue-600">
            슬로우 모드: {payload.duration}초 간격
          </div>
        );

      case DomainEventType.Notification:
        return (
          <div className="space-y-1">
            <div className="font-medium text-indigo-600">시스템 알림</div>
            <div className="text-gray-900 break-all">{payload.message}</div>
            <div className="text-sm text-gray-600">
              표시: {payload.show ? "예" : "아니오"}
            </div>
          </div>
        );

      case DomainEventType.Enter:
        return (
          <div className="text-green-600">{payload.user?.label}님이 입장</div>
        );

      case DomainEventType.Exit:
        return (
          <div className="text-gray-600">{payload.user?.label}님이 퇴장</div>
        );

      case DomainEventType.Connected:
        return <div className="text-green-600">연결됨</div>;

      case DomainEventType.Disconnected:
        return <div className="text-red-600">연결 해제됨</div>;

      case DomainEventType.BJStateChange:
        return <div className="text-blue-600">BJ 상태 변경</div>;

      default:
        return <div className="text-gray-900 break-all">{payload}</div>;
    }
  } catch {
    return <div className="text-gray-900 break-all">{payload}</div>;
  }
};

const getUser = (
  eventType: DomainEventType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
): {
  id: string;
  label: string;
} => {
  switch (eventType) {
    case DomainEventType.Donation:
      return {
        id: payload.from || "",
        label: payload.fromLabel || "",
      };

    case DomainEventType.Subscribe:
      return {
        id: payload.userId || "",
        label: payload.label || "",
      };

    case DomainEventType.MissionDonation:
      return {
        id: payload.from || "",
        label: payload.fromLabel || "",
      };

    case DomainEventType.Mute:
      return {
        id: payload.user?.id || "",
        label: payload.user?.label || "",
      };

    case DomainEventType.Kick:
      return {
        id: payload.user?.id || "",
        label: payload.user?.label || "",
      };

    case DomainEventType.KickCancel:
      return {
        id: payload.userId || "",
        label: "",
      };

    case DomainEventType.Black:
      return {
        id: payload.userId || "",
        label: "",
      };

    case DomainEventType.Enter:
      return {
        id: payload.user?.id || "",
        label: payload.user?.label || "",
      };

    case DomainEventType.Exit:
      return {
        id: payload.user?.id || "",
        label: payload.user?.label || "",
      };

    default:
      return {
        id: "",
        label: "",
      };
  }
};

const EventLogItem: React.FC<Props> = ({ eventLog }) => {
  const user = getUser(eventLog.eventType, eventLog.payload);
  const handleUserClick = useUserPopoverDispatch(user);

  return (
    <div className="border-b border-gray-200 p-3 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {user.label && (
              <span
                className="font-medium text-green-600 cursor-pointer"
                onClick={handleUserClick}
              >
                {user.label}
              </span>
            )}
            <span className="text-sm text-gray-500">
              {eventLog.channelName}
            </span>
            <span className="text-xs text-gray-400">
              {formatTimestamp(eventLog.timestamp)}
            </span>
          </div>

          <div className="">
            {renderEventPayload(eventLog.eventType, eventLog.payload)}
          </div>

          <Link
            href={route.broadcastSession(eventLog.broadcastId)}
            className="text-xs text-gray-600 underline"
          >
            방송: {eventLog.broadcastTitle}
          </Link>
        </div>
        <div className="text-xs text-gray-400 ml-4 font-medium">
          {domainEventLabel[eventLog.eventType]}
        </div>
      </div>
    </div>
  );
};

export const HistoryEventResults: React.FC = () => {
  const { result, search } = useHistoryEventSearchContext();
  const filters = useHistoryEventFilterCtx();

  const handlePageChange = (page: number, pageSize: number) => {
    if (filters) {
      search(filters, { page, pageSize });
    }
  };

  if (!result) {
    return (
      <div className="p-8 text-center text-gray-500">
        검색 결과를 보려면 검색을 시작하세요.
      </div>
    );
  }

  if (result.eventLogs.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">검색 결과가 없습니다.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {result.eventLogs.map((eventLog) => (
          <EventLogItem key={eventLog.id} eventLog={eventLog} />
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
