import { useMuteLogPopoverDispatch } from "~/features/popover/hooks/mute-log-popover";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { MuteLog } from "./types";

type Props = {
  rank: number;
  data: MuteLog | null;
};

export const UserHistoriesTableItem: React.FC<Props> = ({ rank, data }) => {
  const handleUserClick = useUserPopoverDispatch(data?.user);
  const handleMuteLogClick = useMuteLogPopoverDispatch(data);

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
              : "bg-green-100 text-green-800"
          }`}
        >
          {rank}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          onClick={handleUserClick}
          className="inline-block bg-gray-100 text-gray-800 underline px-2 py-1 cursor-pointer rounded-md text-sm font-medium"
        >
          {data?.user.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span
          onClick={handleMuteLogClick}
          className="text-sm cursor-pointer underline font-semibold text-gray-900"
        >
          {data?.logs.length.toLocaleString()}
        </span>
      </td>
    </>
  );
};
