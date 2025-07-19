// Channel 선택, 사용자 아이디, 이벤트 종류, 방송 아이디, 날짜

import { PropsWithChildren } from "react";
import { usePaginationContext } from "~/common/context/pagination";
import { HistoryChatFilterProvider } from "../context/history-chat-filter-context";
import { useHistoryChatSearchContext } from "../context/history-chat-search-context";
import {
  convertFilter,
  useHistoryChatFilter,
} from "../hooks/history-chat-filter";
import { HistoryChannelCondition } from "./history-channel-condition";
import { HistoryChatTypeCondition } from "./history-chat-type-condition";
import { HistoryPeriodCondition } from "./history-period-condition";
import { HistoryTextCondition } from "./history-text-condition";
import { HistoryUserCondition } from "./history-user-condition";

export const HistoryChatFilter: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const pagination = usePaginationContext();
  const search = useHistoryChatSearchContext().search;
  const { watch, reset, setValue, getValues } = useHistoryChatFilter();

  const w = watch();

  const handleSearch = () => search(convertFilter(getValues()), pagination);

  return (
    <>
      <div>
        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex gap-2">
            <HistoryChannelCondition
              channel={w.channel}
              onSelect={(c) => setValue("channel", c)}
            />
            <HistoryUserCondition
              userId={w.userId}
              onChange={(u) => setValue("userId", u)}
            />
            <HistoryPeriodCondition
              startDate={w.startDate}
              endDate={w.endDate}
              onStartDateChange={(date) => setValue("startDate", date)}
              onEndDateChange={(date) => setValue("endDate", date)}
            />
            <HistoryChatTypeCondition
              chatType={w.messageType}
              onChange={(ct) => setValue("messageType", ct)}
            />
            <HistoryTextCondition
              text={w.messageContains}
              onChange={(text) => setValue("messageContains", text)}
            />
          </div>

          <div className="mt-2 flex gap-2 justify-end">
            <button
              onClick={() => reset()}
              className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              초기화
            </button>
            <button
              onClick={handleSearch}
              className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-gray-600"
            >
              검색
            </button>
          </div>
        </div>
      </div>
      <HistoryChatFilterProvider value={convertFilter(w)}>
        {children}
      </HistoryChatFilterProvider>
    </>
  );
};
