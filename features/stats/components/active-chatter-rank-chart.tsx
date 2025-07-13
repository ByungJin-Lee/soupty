import { useStatsEventStore } from "~/common/stores/stats-event-store";

export const ActiveChatterRankChart = () => {
  const rankings = useStatsEventStore(
    (v) => v.activeChatterRanking.data.rankings
  );

  if (rankings.length === 0) {
    return (
      <div className="stats-chart flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">데이터가 없습니다.</div>
        </div>
      </div>
    );
  }

  const topRankings = rankings.slice(0, 10);

  return (
    <table className="w-full">
      <tbody className="divide-y divide-gray-200">
        {topRankings.map((ranking, index) => (
          <tr
            key={ranking.userId}
            className={`hover:bg-gray-50 transition-colors ${
              index < 3 ? "bg-gradient-to-r from-yellow-50 to-amber-50" : ""
            }`}
          >
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                      ${
                        index === 0
                          ? "bg-yellow-500 text-white"
                          : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
              >
                {index + 1}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="font-medium text-gray-900 truncate max-w-32">
                {ranking.nickname}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-32">
                {ranking.userId}
              </div>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {ranking.chatCount}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
