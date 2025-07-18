// Channel 선택, 사용자 아이디, 이벤트 종류, 방송 아이디, 날짜

import { useHistoryChatFilter } from "../hooks/history-chat-filter";
import { HistoryChannelCondition } from "./history-channel-condition";
import { HistoryUserCondition } from "./history-user-condition";

export const HistoryChatFilter = () => {
  const { watch, reset, setValue } = useHistoryChatFilter();

  const w = watch();

  return (
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
          {/* 
          <div>
            <label className="block text-sm font-medium mb-1">
              메시지 타입
            </label>
            <select
              value={chatFilters.messageType || ""}
              onChange={(e) =>
                setChatFilters({
                  ...chatFilters,
                  messageType: e.target.value || undefined,
                })
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="">전체</option>
              <option value="TEXT">텍스트</option>
              <option value="EMOTICON">이모티콘</option>
              <option value="STICKER">스티커</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">시작 날짜</label>
            <input
              type="datetime-local"
              value={chatFilters.startDate || ""}
              onChange={(e) =>
                setChatFilters({
                  ...chatFilters,
                  startDate: e.target.value || undefined,
                })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">종료 날짜</label>
            <input
              type="datetime-local"
              value={chatFilters.endDate || ""}
              onChange={(e) =>
                setChatFilters({
                  ...chatFilters,
                  endDate: e.target.value || undefined,
                })
              }
              className="w-full p-2 border rounded-md"
            />
          </div> */}
        </div>

        <div className="mt-4 flex gap-4">
          {/* <button
            onClick={handleChatSearch}
            disabled={chatLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {chatLoading ? "검색 중..." : "검색"}
          </button> */}

          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
};
