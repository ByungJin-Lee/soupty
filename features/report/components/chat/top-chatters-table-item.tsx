import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { ChatterRank } from "~/services/ipc/types";

type Props = {
  rank: number;
  data: ChatterRank | null;
};

export const TopChattersTableItem: React.FC<Props> = ({ rank, data }) => {
  const handleUserClick = useUserPopoverDispatch(data?.user);

  if (!data) return null;

  return (
    <>
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
            rank === 1
              ? "bg-yellow-100 text-yellow-800"
              : rank === 2
              ? "bg-gray-100 text-gray-800"
              : rank === 3
              ? "bg-orange-100 text-orange-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {rank + 1}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          onClick={handleUserClick}
          className="cursor-pointer  bg-gray-100 text-gray-800 underline px-2 py-1 rounded-md text-sm font-medium"
        >
          {data.user.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-sm font-semibold text-gray-900">
          {data.messageCount.toLocaleString()}
        </span>
      </td>
    </>
  );
};
