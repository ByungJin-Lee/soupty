import { Link } from "react-feather";
import { Pagination } from "~/common/ui/pagination";
import { route } from "~/constants";
import { EventLogResult } from "~/services/ipc/types";
import { domainEventLabel, DomainEventType } from "~/types";
import { useHistoryEventFilterCtx } from "../context/history-event-filter-context";
import { useHistoryEventSearchContext } from "../context/history-event-search-context";
import { formatTimestamp } from "../utils/format";

type Props = {
  eventLog: EventLogResult;
};

const renderEventPayload = (eventType: DomainEventType, payload: any) => {
  try {
    const parsedPayload = JSON.parse(payload);

    switch (eventType) {
      case DomainEventType.Chat:
        return (
          <div className="space-y-1">
            <div className="text-gray-900 break-all">
              {parsedPayload.comment}
            </div>
            {parsedPayload.user && (
              <div className="text-sm text-gray-600">
                사용자: {parsedPayload.user.label} ({parsedPayload.user.id})
              </div>
            )}
          </div>
        );

      case DomainEventType.Donation:
        return (
          <div className="space-y-1">
            <div className="font-medium text-yellow-600">
              {parsedPayload.fromLabel}님이 {parsedPayload.amount}개 후원
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
            <div className="font-medium text-purple-600">
              {parsedPayload.label}님이 구독
            </div>
            <div className="text-sm text-gray-600">
              티어: {parsedPayload.tier} • 갱신: {parsedPayload.renew}개월
            </div>
          </div>
        );

      case DomainEventType.MissionDonation:
        return (
          <div className="space-y-1">
            <div className="font-medium text-blue-600">
              {parsedPayload.fromLabel}님이 미션 후원 {parsedPayload.amount}개
            </div>
            <div className="text-sm text-gray-600">
              미션 타입: {parsedPayload.missionType}
            </div>
          </div>
        );

      case DomainEventType.MissionTotal:
        return (
          <div className="font-medium text-blue-600">
            미션 총합: {parsedPayload.amount}개 ({parsedPayload.missionType})
          </div>
        );

      case DomainEventType.ChallengeMissionResult:
        return (
          <div className="space-y-1">
            <div
              className={`font-medium ${
                parsedPayload.isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              챌린지 미션 {parsedPayload.isSuccess ? "성공" : "실패"}
            </div>
            <div className="text-gray-900">{parsedPayload.title}</div>
          </div>
        );

      case DomainEventType.BattleMissionResult:
        return (
          <div className="space-y-1">
            <div className="font-medium text-orange-600">
              배틀 미션 결과:{" "}
              {parsedPayload.isDraw ? "무승부" : `${parsedPayload.winner} 승리`}
            </div>
            <div className="text-gray-900">{parsedPayload.title}</div>
          </div>
        );

      case DomainEventType.Mute:
        return (
          <div className="space-y-1">
            <div className="font-medium text-red-600">
              {parsedPayload.user?.label}님이 뮤트됨 ({parsedPayload.seconds}초)
            </div>
            <div className="text-sm text-gray-600">
              실행자: {parsedPayload.by} • 누적: {parsedPayload.counts}회
            </div>
          </div>
        );

      case DomainEventType.Kick:
        return (
          <div className="font-medium text-red-600">
            {parsedPayload.user?.label}님이 킥됨
          </div>
        );

      case DomainEventType.KickCancel:
        return (
          <div className="font-medium text-green-600">
            킥이 취소됨 (사용자 ID: {parsedPayload.userId})
          </div>
        );

      case DomainEventType.Black:
        return (
          <div className="font-medium text-black">
            사용자가 블랙리스트에 추가됨 (ID: {parsedPayload.userId})
          </div>
        );

      case DomainEventType.Freeze:
        return (
          <div className="space-y-1">
            <div className="font-medium text-blue-600">
              채팅 제한 {parsedPayload.freezed ? "활성화" : "비활성화"}
            </div>
            <div className="text-sm text-gray-600">
              구독 {parsedPayload.limitSubscriptionMonth}개월 이상 • 풍선{" "}
              {parsedPayload.limitBalloons}개 이상
            </div>
            {parsedPayload.targets?.length > 0 && (
              <div className="text-sm text-gray-600">
                대상: {parsedPayload.targets.join(", ")}
              </div>
            )}
          </div>
        );

      case DomainEventType.Slow:
        return (
          <div className="font-medium text-blue-600">
            슬로우 모드: {parsedPayload.duration}초 간격
          </div>
        );

      case DomainEventType.Notification:
        return (
          <div className="space-y-1">
            <div className="font-medium text-indigo-600">시스템 알림</div>
            <div className="text-gray-900 break-all">
              {parsedPayload.message}
            </div>
            <div className="text-sm text-gray-600">
              표시: {parsedPayload.show ? "예" : "아니오"}
            </div>
          </div>
        );

      case DomainEventType.MetadataUpdate:
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-600">방송 정보 업데이트</div>
            <div className="text-gray-900">{parsedPayload.title}</div>
            <div className="text-sm text-gray-600">
              시청자: {parsedPayload.viewerCount?.toLocaleString()}명
            </div>
          </div>
        );

      case DomainEventType.Enter:
        return (
          <div className="text-green-600">
            {parsedPayload.user?.label}님이 입장
          </div>
        );

      case DomainEventType.Exit:
        return (
          <div className="text-gray-600">
            {parsedPayload.user?.label}님이 퇴장
          </div>
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

const EventLogItem: React.FC<Props> = ({ eventLog }) => {
  return (
    <div className="border-b border-gray-200 p-3 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {eventLog.username && (
              <span className="font-medium text-green-600">
                {eventLog.username}
              </span>
            )}
            <span className="text-sm text-gray-500">
              {eventLog.channelName}
            </span>
            <span className="text-xs text-gray-400">
              {formatTimestamp(eventLog.timestamp)}
            </span>
          </div>

          <div className="mb-2">
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
