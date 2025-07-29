// Channel 선택, 사용자 아이디, 이벤트 종류, 방송 아이디, 날짜

import { PropsWithChildren } from "react";
import { usePaginationContext } from "~/common/context/pagination";
import {
  BroadcastSessionCondition,
  ChannelCondition,
  ChatTypeCondition,
  PeriodCondition,
  TextCondition,
  UserCondition,
  UsernameCondition,
} from "~/features/condition";
import { HistoryChatFilterProvider } from "../context/history-chat-filter-context";
import { useHistoryChatSearchContext } from "../context/history-chat-search-context";
import {
  convertFilter,
  useHistoryChatFilter,
} from "../hooks/history-chat-filter";
import { ChatCsvExportButton } from "./history-csv-export-button";

export const HistoryChatFilter: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const pagination = usePaginationContext();
  const search = useHistoryChatSearchContext().search;
  const { filter, updateFilter } = useHistoryChatFilter();

  const handleSearch = () => search(convertFilter(filter), pagination);

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
        <ChatTypeCondition
          chatType={filter.messageType}
          onChange={updateFilter.setMessageType}
        />
        <TextCondition
          text={filter.messageContains}
          onChange={updateFilter.setMessageContains}
        />
        <BroadcastSessionCondition
          broadcastSession={filter.session}
          onSelect={updateFilter.setSession}
        />
        <div className="ml-auto flex gap-2">
          <ChatCsvExportButton filters={convertFilter(filter)} />
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
      <HistoryChatFilterProvider value={convertFilter(filter)}>
        {children}
      </HistoryChatFilterProvider>
    </>
  );
};
