import { openBroadcastSession } from "~/features/broadcast/utils/opener";
import { EventDisplayUtil } from "~/features/event/utils/event-display";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { EventLogResult } from "~/services/ipc/types";
import { DomainEvent, domainEventLabel } from "~/types";
import { formatYYYYMMDDHHMMSS } from "../../utils/format";

type Props = {
  eventLog: EventLogResult;
};

export const HistoryEventItem: React.FC<Props> = ({ eventLog }) => {
  const domainEvent: DomainEvent = {
    id: eventLog.id,
    type: eventLog.eventType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: eventLog.payload as any,
  };

  const user = EventDisplayUtil.extractUser(domainEvent);
  const handleUserClick = useUserPopoverDispatch(user, {
    channelId: eventLog.channelId,
  });

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
        className={`text-md text-center ${EventDisplayUtil.getEventTypeColor(
          eventLog.eventType
        )}`}
      >
        {domainEventLabel[eventLog.eventType]}
      </div>
      <div>{EventDisplayUtil.exportHistory(domainEvent)}</div>
      <div className="text-gray-600 text-center">{eventLog.channelName}</div>
      <div className="overflow-hidden text-ellipsis min-w-0">
        <button
          onClick={() => openBroadcastSession(eventLog.broadcastId)}
          className="text-blue-600 hover:underline text-nowrap"
        >
          {eventLog.broadcastTitle}
        </button>
      </div>
    </>
  );
};
