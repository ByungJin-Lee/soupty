import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { GiftEvent, giftTypeLabel, unpackGift } from "~/types";

type Props = {
  data: GiftEvent;
};

export const GiftRow: React.FC<Props> = ({ data }) => {
  const handleClick = useUserPopoverDispatch({
    id: data.senderId,
    label: data.senderLabel,
  });

  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-400 shadow-lg shadow-violet-300/60 border border-sky-300 transform hover:scale-[1.02] transition-all duration-200">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg mr-1">🎁</span>
          <span className="font-bold text-violet-900 text-base">
            {giftTypeLabel[data.giftType]} 선물
          </span>
        </div>
        <span className="px-2 py-0.5 bg-indigo-200 text-indigo-900 font-semibold rounded-md">
          {unpackGift(data.giftType, data.giftCode)}
        </span>
      </div>

      {/* 후원자 정보 */}
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-black font-medium">후원자:</span>
          <span
            onClick={handleClick}
            className="cursor-pointer text-black text-md bg-gray-100/40 px-2 py-0.5 rounded-lg"
          >
            {data.senderLabel}
          </span>
        </div>
      </div>
      {/* 수혜자 정보 */}
      <div className="flex items-center mt-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-black font-medium">수혜자:</span>
          <span className="cursor-pointer text-black text-md bg-gray-100/40 px-2 py-0.5 rounded-lg">
            {data.receiverLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
