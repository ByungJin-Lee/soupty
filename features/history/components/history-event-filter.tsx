import { PropsWithChildren } from "react";
import { usePaginationContext } from "~/common/context/pagination";
import { HistoryEventFilterProvider } from "../context/history-event-filter-context";
import { useHistoryEventSearchContext } from "../context/history-event-search-context";
import {
  convertEventFilter,
  useHistoryEventFilter,
} from "../hooks/history-event-filter";
import { HistoryBroadcastSessionCondition } from "./history-broadcast-session-condition";
import { HistoryChannelCondition } from "./history-channel-condition";
import { HistoryEventTypeCondition } from "./history-event-type-condition";
import { HistoryPeriodCondition } from "./history-period-condition";
import { HistoryUserCondition } from "./history-user-condition";
import { HistoryUsernameCondition } from "./history-username-condition";
import { EventCsvExportButton } from "./history-csv-export-button";

export const HistoryEventFilter: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const pagination = usePaginationContext();
  const search = useHistoryEventSearchContext().search;
  const { watch, reset, setValue, getValues } = useHistoryEventFilter();

  const w = watch();

  const handleSearch = () =>
    search(convertEventFilter(getValues()), pagination);

  return (
    <>
      <div className="bg-gray-50 p-3 rounded-lg mb-3 flex gap-2 flex-wrap">
        <HistoryChannelCondition
          channel={w.channel}
          onSelect={(c) => setValue("channel", c)}
        />
        <HistoryUserCondition
          userId={w.userId}
          onChange={(u) => setValue("userId", u)}
        />
        <HistoryUsernameCondition
          username={w.username}
          onChange={(u) => setValue("username", u)}
        />
        <HistoryPeriodCondition
          startDate={w.startDate}
          endDate={w.endDate}
          onStartDateChange={(date) => setValue("startDate", date)}
          onEndDateChange={(date) => setValue("endDate", date)}
        />
        <HistoryEventTypeCondition
          eventType={w.eventType}
          onChange={(et) => setValue("eventType", et)}
        />
        <HistoryBroadcastSessionCondition
          broadcastSession={w.broadcastSession}
          onSelect={(s) => setValue("broadcastSession", s)}
        />
        <div className="ml-auto flex gap-2">
          <EventCsvExportButton filters={convertEventFilter(w)} />
          <button
            onClick={() => reset()}
            className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            초기화
          </button>
          <button
            onClick={handleSearch}
            className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            검색
          </button>
        </div>
      </div>
      <HistoryEventFilterProvider value={convertEventFilter(w)}>
        {children}
      </HistoryEventFilterProvider>
    </>
  );
};
