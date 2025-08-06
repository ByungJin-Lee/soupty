import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { useChannel } from "~/features/soop";
import { ActiveChatterRankingItem } from "~/types/stats";

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
          <ActiveChatterRankItem key={index} rank={index + 1} data={ranking} />
        ))}
      </tbody>
    </table>
  );
};

type ItemProps = {
  data: ActiveChatterRankingItem;
  rank: number;
};

const ActiveChatterRankItem: React.FC<ItemProps> = ({ data, rank }) => {
  const channel = useChannel((v) => v.channel);
  const handleClick = useUserPopoverDispatch(data.user, {
    channelId: channel?.id,
  });

  return (
    <tr
      key={data.user.id}
      className={`hover:bg-gray-50 transition-colors ${
        rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-amber-50" : ""
      }`}
    >
      <td className="px-2 py-2">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                      ${
                        rank === 1
                          ? "bg-yellow-500 text-white"
                          : rank === 2
                          ? "bg-gray-400 text-white"
                          : rank === 3
                          ? "bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
        >
          {rank}
        </span>
      </td>
      <td className="px-2 cursor-pointer">
        <div
          className="font-medium text-gray-900 w-fit px-2 truncate max-w-32 hover:bg-gray-200 rounded-md"
          onClick={handleClick}
        >
          {data.user.label}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {data.chatCount}
        </span>
      </td>
    </tr>
  );
};
