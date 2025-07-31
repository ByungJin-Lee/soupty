import { PropsWithChildren, useEffect } from "react";
import toast from "react-hot-toast";
import { usePaginationContext } from "~/common/context/pagination";
import {
  BroadcastSessionCondition,
  ChannelCondition,
  PeriodCondition,
  UserCondition,
} from "~/features/condition";
import { HistoryUserFilterProvider } from "../context/history-user-filter-context";
import { useHistoryUserSearchContext } from "../context/history-user-search-context";
import {
  convertFilter,
  useHistoryUserFilter,
} from "../hooks/history-user-filter";

export const HistoryUserFilter: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const pagination = usePaginationContext();
  const search = useHistoryUserSearchContext().search;
  const { filter, updateFilter } = useHistoryUserFilter();

  const handleSearch = () => {
    if (!filter.userId.trim()) {
      toast.error("사용자 아이디를 입력해주세요.");
      return;
    }
    // 첫 페이지로 돌아갑니다.
    search(convertFilter(filter), {
      page: 1,
      pageSize: pagination.pageSize,
    });
    pagination.setPage(1);
  };

  useEffect(() => {
    if (filter.userId.length > 0) handleSearch();
  }, []);

  return (
    <>
      <div className="bg-gray-50 p-3 rounded-lg mb-3 flex gap-2 flex-wrap">
        <UserCondition
          userId={filter.userId}
          onChange={updateFilter.setUserId}
        />
        <ChannelCondition
          channel={filter.channel}
          onSelect={updateFilter.setChannel}
        />
        <BroadcastSessionCondition
          broadcastSession={filter.session}
          onSelect={updateFilter.setSession}
        />
        <PeriodCondition
          startDate={filter.startDate}
          endDate={filter.endDate}
          onStartDateChange={updateFilter.setStartDate}
          onEndDateChange={updateFilter.setEndDate}
        />
        <div className="ml-auto flex gap-2">
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
      <HistoryUserFilterProvider value={convertFilter(filter)}>
        {children}
      </HistoryUserFilterProvider>
    </>
  );
};
