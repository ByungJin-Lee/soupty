import { useMemo } from "react";
import { UserHistory } from "~/services/ipc/types";
import { MuteLog } from "./types";
import { UserHistoriesTableItem } from "./user-histories-table-item";

type Props = {
  histories: UserHistory[];
  title: string;
};

export const UserHistoriesTable: React.FC<Props> = ({ histories, title }) => {
  const merged = useMemo(() => {
    const zip = histories.reduce((acc, h) => {
      if (!acc[h.user.id]) {
        acc[h.user.id] = {
          user: h.user,
          logs: [],
        };
      }

      acc[h.user.id].logs.push({
        timestamp: h.timestamp,
        by: h.by,
      });

      return acc;
    }, {} as Record<string, MuteLog>);

    return Object.values(zip).toSorted(
      (lhs, rhs) => rhs.logs.length - lhs.logs.length
    );
  }, [histories]);

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm mr-2">
          👹
        </span>
        {title}
      </h4>
      {merged.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider w-16">
                  순위
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider w-32">
                  이름
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-green-700 uppercase tracking-wider w-24">
                  횟수
                </th>
                <th className="px-2 py-3 border-l border-green-200 w-4"></th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider w-16">
                  순위
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider w-32">
                  이름
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-green-700 uppercase tracking-wider w-24">
                  횟수
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({
                length: Math.ceil(merged.length / 2),
              }).map((_, rowIndex) => {
                const leftIdx = rowIndex * 2;
                const rightIdx = leftIdx + 1;
                const lhs = merged[leftIdx];
                const rhs = merged[rightIdx];

                return (
                  <tr
                    key={`word-row-${rowIndex}`}
                    className="hover:bg-green-25 transition-colors"
                  >
                    <UserHistoriesTableItem rank={leftIdx + 1} data={lhs} />
                    <td className="px-2 border-l border-gray-200"></td>
                    {rhs && (
                      <UserHistoriesTableItem rank={rightIdx + 1} data={rhs} />
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-center py-12">
          <div className="text-4xl mb-2">📝</div>
          <div className="font-medium">데이터가 없습니다.</div>
        </div>
      )}
    </div>
  );
};
