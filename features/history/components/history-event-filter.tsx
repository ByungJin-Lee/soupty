import { PropsWithChildren } from "react";
import { usePaginationContext } from "~/common/context/pagination";
import {
  BroadcastSessionCondition,
  ChannelCondition,
  EventTypeCondition,
  PeriodCondition,
  UserCondition,
  UsernameCondition,
} from "~/features/condition";
import { HistoryEventFilterProvider } from "../context/history-event-filter-context";
import { useHistoryEventSearchContext } from "../context/history-event-search-context";
import {
  convertEventFilter,
  useHistoryEventFilter,
} from "../hooks/history-event-filter";
import { EventCsvExportButton } from "./history-csv-export-button";

export const HistoryEventFilter: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const pagination = usePaginationContext();
  const search = useHistoryEventSearchContext().search;
  const { filter, updateFilter } = useHistoryEventFilter();

  const handleSearch = () => search(convertEventFilter(filter), pagination);

  return (
    <>
      <div className="bg-gray-50 p-3 rounded-lg mb-3 flex gap-2 flex-wrap">
        <ChannelCondition
          channel={filter.channel}
          onSelect={updateFilter.setChannel}
        />
        <UserCondition
          userId={filter.userId}
          onChange={updateFilter.setUserId}
        />
        <UsernameCondition
          username={filter.username}
          onChange={updateFilter.setUsername}
        />
        <PeriodCondition
          startDate={filter.startDate}
          endDate={filter.endDate}
          onStartDateChange={updateFilter.setStartDate}
          onEndDateChange={updateFilter.setEndDate}
        />
        <EventTypeCondition
          eventType={filter.eventType}
          onChange={updateFilter.setEventType}
        />
        <BroadcastSessionCondition
          broadcastSession={filter.broadcastSession}
          onSelect={updateFilter.setBroadcastSession}
        />
        <div className="ml-auto flex gap-2">
          <EventCsvExportButton filters={convertEventFilter(filter)} />
          <button
            onClick={updateFilter.reset}
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
      <HistoryEventFilterProvider value={convertEventFilter(filter)}>
        {children}
      </HistoryEventFilterProvider>
    </>
  );
};
