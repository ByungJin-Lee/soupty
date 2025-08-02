import { ChatterRank } from "~/services/ipc/types";
import { TopChattersTableItem } from "./top-chatters-table-item";

type Props = {
  topChatters: ChatterRank[];
};

export const TopChattersTable: React.FC<Props> = ({ topChatters }) => {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm mr-2">
          👑
        </span>
        상위 채팅 사용자
      </h4>
      {topChatters.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider w-16">
                  순위
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider w-32">
                  사용자
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider w-24">
                  메시지
                </th>
                <th className="px-2 py-3 border-l border-blue-200 w-4"></th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider w-16">
                  순위
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider w-32">
                  사용자
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider w-24">
                  메시지
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({
                length: Math.ceil(topChatters.length / 2),
              }).map((_, rowIndex) => {
                const leftIdx = rowIndex * 2;
                const rightIdx = leftIdx + 1;
                const lhs = topChatters[leftIdx];
                const rhs = topChatters[rightIdx];

                return (
                  <tr
                    key={`row-${rowIndex}`}
                    className="hover:bg-blue-25 transition-colors"
                  >
                    <TopChattersTableItem rank={leftIdx + 1} data={lhs} />
                    <td className="px-2 border-l border-gray-200"></td>
                    {rhs && (
                      <TopChattersTableItem rank={rightIdx + 1} data={rhs} />
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-center py-12">
          <div className="text-4xl mb-2">💬</div>
          <div className="font-medium">채팅 데이터가 없습니다</div>
        </div>
      )}
    </div>
  );
};
