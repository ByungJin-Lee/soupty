import { useMemo } from "react";
import { useDebounceState } from "~/common/hooks";
import { filterChunksByLolScore } from "~/common/utils";
import { ReportData } from "~/services/ipc/types";
import { ReportLineChart } from "../report-line-chart";
import { LOLChunkTableItem } from "./lol-chunk-table-item";

type Props = {
  data: ReportData;
};

const MIN_THRESHOLD = 10;

export const LOLTrendChart: React.FC<Props> = ({ data }) => {
  const [displayThreshold, debouncedThreshold, setThreshold] = useDebounceState<number>(MIN_THRESHOLD);

  const filteredChunks = useMemo(() => {
    return filterChunksByLolScore(data.chunks, data.metadata, debouncedThreshold);
  }, [data.chunks, data.metadata, debouncedThreshold]);

  return (
    <div className="bg-white border overflow-hidden border-gray-200 rounded-xl  shadow-sm">
      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex p-6 items-center">
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm mr-2">
          📊
        </span>
        웃음 수 추이
        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          &#39;ㅋ&#39; 이 포함된 채팅 수(클립 각을 확인하세요!)
        </span>
      </h4>
      <ReportLineChart
        startAt={data.metadata.startTime}
        chunks={data.chunks}
        getter={(v) => v.chat.lolScore}
        color="green"
      />

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-end items-center gap-2 mr-2">
          <p className="text-sm text-gray-500">오차가 있을 수 있습니다.</p>
          <label
            htmlFor="lol-threshold"
            className="block text-sm font-medium text-gray-700"
          >
            필터
          </label>
          <input
            id="lol-threshold"
            type="number"
            min={MIN_THRESHOLD}
            value={displayThreshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="block px-2 py-1 border w-24 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={MIN_THRESHOLD.toString()}
          />
        </div>

        {filteredChunks.length > 0 ? (
          <div className="bg-white border-t border-b border-gray-200 shadow-sm overflow-hidden mt-2">
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider w-48">
                    타임스탬프
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider w-24">
                    점수
                  </th>
                  <th className="px-2 py-3 border-l border-green-200 w-4"></th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider w-48">
                    타임스탬프
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider w-24">
                    점수
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({
                  length: Math.ceil(filteredChunks.length / 2),
                }).map((_, rowIndex) => {
                  const leftIdx = rowIndex * 2;
                  const rightIdx = leftIdx + 1;
                  const leftItem = filteredChunks[leftIdx];
                  const rightItem = filteredChunks[rightIdx];

                  return (
                    <tr
                      key={`row-${rowIndex}`}
                      className="hover:bg-green-25 transition-colors"
                    >
                      <LOLChunkTableItem data={leftItem} />
                      <td className="px-2 border-l border-gray-200"></td>
                      {rightItem && <LOLChunkTableItem data={rightItem} />}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-center py-12">
              <div className="text-4xl mb-2">📊</div>
              <div className="font-medium">
                임계값 {debouncedThreshold} 이상의 데이터가 없습니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
