import Link from "next/link";
import { route } from "~/constants";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { EventLogResult } from "~/services/ipc/types";
import {
  domainEventLabel,
  DomainEventType,
  DonationType,
  donationTypeLabel,
} from "~/types";
import { formatYYYYMMDDHHMMSS } from "../../utils/format";

const getEventTypeColor = (eventType: DomainEventType): string => {
  switch (eventType) {
    case DomainEventType.Donation:
      return "text-yellow-600";
    case DomainEventType.Subscribe:
      return "text-purple-600";
    case DomainEventType.MissionDonation:
    case DomainEventType.MissionTotal:
      return "text-blue-600";
    case DomainEventType.ChallengeMissionResult:
      return "text-green-600";
    case DomainEventType.BattleMissionResult:
      return "text-orange-600";
    case DomainEventType.Mute:
    case DomainEventType.Kick:
    case DomainEventType.Black:
    case DomainEventType.Disconnected:
      return "text-red-600";
    case DomainEventType.KickCancel:
    case DomainEventType.Connected:
    case DomainEventType.Enter:
      return "text-green-600";
    case DomainEventType.Freeze:
    case DomainEventType.Slow:
    case DomainEventType.BJStateChange:
      return "text-blue-600";
    case DomainEventType.Notification:
      return "text-indigo-600";
    case DomainEventType.Exit:
      return "text-gray-600";
    default:
      return "text-gray-700";
  }
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
          <div>
            <div className="">
              <span className="text-blue-600">{payload.amount}</span>개 후원
              <span className="ml-2 text-sm">
                ({donationTypeLabel[payload.donationType as DonationType]})
              </span>
            </div>
            {payload.message && (
              <div className="text-gray-900 break-all">
                &quot;{payload.message}&quot;
              </div>
            )}
            <div className="text-sm text-gray-600">
              {payload.becomeTopFan && " • 새로운 탑팬!"}
            </div>
          </div>
        );

      case DomainEventType.Subscribe:
        return (
          <div>
            <div className="text-sm text-gray-600">
              티어: {payload.tier} • 갱신: {payload.renew}개월
            </div>
          </div>
        );

      case DomainEventType.MissionDonation:
        return (
          <div>
            <div className="font-medium">{payload.amount}개</div>
            <div className="text-sm text-gray-600">
              미션 타입: {payload.missionType}
            </div>
          </div>
        );

      case DomainEventType.MissionTotal:
        return (
          <div className="font-medium">
            총합: {payload.amount}개 ({payload.missionType})
          </div>
        );

      case DomainEventType.ChallengeMissionResult:
        return (
          <div>
            <div
              className={`font-medium ${
                payload.isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {payload.isSuccess ? "성공" : "실패"}
            </div>
            <div className="text-gray-900">{payload.title}</div>
          </div>
        );

      case DomainEventType.BattleMissionResult:
        return (
          <div>
            <div className="font-medium">
              {payload.isDraw ? "무승부" : `${payload.winner} 승리`}
            </div>
            <div className="text-gray-900">{payload.title}</div>
          </div>
        );

      case DomainEventType.Mute:
        return (
          <div>
            <div className="font-medium">
              {payload.seconds}초 • 누적: {payload.counts}회
            </div>
            <div className="text-sm text-gray-600">실행자: {payload.by}</div>
          </div>
        );

      case DomainEventType.Kick:
        return <div className="font-medium">강제퇴장</div>;

      case DomainEventType.KickCancel:
        return (
          <div className="font-medium">
            취소됨 (사용자 ID: {payload.userId})
          </div>
        );

      case DomainEventType.Black:
        return (
          <div className="font-medium">
            블랙리스트 추가 (ID: {payload.userId})
          </div>
        );

      case DomainEventType.Freeze:
        return (
          <div>
            <div className="font-medium">
              {payload.freezed ? "활성화" : "비활성화"}
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
        return <div className="font-medium">{payload.duration}초 간격</div>;

      case DomainEventType.Notification:
        return (
          <div>
            <div className="text-gray-900 break-all">{payload.message}</div>
            <div className="text-sm text-gray-600">
              표시: {payload.show ? "예" : "아니오"}
            </div>
          </div>
        );

      case DomainEventType.Enter:
        return <div>{payload.user?.label}님이 입장</div>;

      case DomainEventType.Exit:
        return <div>{payload.user?.label}님이 퇴장</div>;

      case DomainEventType.Connected:
        return <div>연결됨</div>;

      case DomainEventType.Disconnected:
        return <div>연결 해제됨</div>;

      case DomainEventType.BJStateChange:
        return <div>BJ 상태 변경</div>;

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

type Props = {
  eventLog: EventLogResult;
};

export const HistoryEventItem: React.FC<Props> = ({ eventLog }) => {
  const user = getUser(eventLog.eventType, eventLog.payload);
  const handleUserClick = useUserPopoverDispatch(user);

  return (
    <>
      <div>
        {user.label && (
          <span
            className="font-medium text-green-600 cursor-pointer hover:underline"
            onClick={handleUserClick}
          >
            {user.label}
          </span>
        )}
      </div>
      <div className="text-gray-600">
        {formatYYYYMMDDHHMMSS(eventLog.timestamp)}
      </div>
      <div
        className={`text-md text-center ${getEventTypeColor(
          eventLog.eventType
        )}`}
      >
        {domainEventLabel[eventLog.eventType]}
      </div>
      <div>{renderEventPayload(eventLog.eventType, eventLog.payload)}</div>
      <div className="text-gray-600 text-center">{eventLog.channelName}</div>
      <div className="overflow-hidden text-ellipsis min-w-0">
        <Link
          href={route.broadcastSession(eventLog.broadcastId)}
          className="text-blue-600 hover:underline text-nowrap"
        >
          {eventLog.broadcastTitle}
        </Link>
      </div>
    </>
  );
};