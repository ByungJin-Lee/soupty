import { formatDayTimestamp } from "~/common/utils";
import { ChatMessage } from "~/features/chat";
import { DomainEvent, DomainEventType, MissionType } from "~/types";
import { History } from "../../hooks/live-user-history";

type Props = {
  data: History;
};

export const LiveUserHistoryRow: React.FC<Props> = ({ data }) => {
  let el;

  switch (data.variant) {
    case "chat":
      el = <ChatMessage parts={data.data.parts} />;
      break;
    case "event":
      el = <EventRow data={data.data} />;
      break;
  }

  return (
    <div>
      <p className="text-sm text-gray-400">
        {formatDayTimestamp(data.timestamp)}
      </p>
      {el}
    </div>
  );
};

interface EventRowProps {
  data: DomainEvent;
}

const EventRow: React.FC<EventRowProps> = ({ data }) => {
  switch (data.type) {
    case DomainEventType.Mute:
      return <p className="text-red-400">채팅금지 by.{data.payload.by})</p>;
    case DomainEventType.Donation:
      return <p className="text-blue-500">별풍선 {data.payload.amount}개</p>;
    case DomainEventType.MissionDonation:
      return (
        <p className="text-blue-500">
          {data.payload.missionType === MissionType.Battle ? "대결" : "미션"}{" "}
          별풍선 {data.payload.amount}개
        </p>
      );
    case DomainEventType.Subscribe:
      return (
        <p className="text-amber-500">
          구독 {data.payload.tier}티어(
          {data.payload.renew > 0 ? `${data.payload.renew}개월` : "신규 구독"})
        </p>
      );
  }
};
