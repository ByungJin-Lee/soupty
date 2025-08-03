import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { StickerEvent } from "~/types";

type Props = {
  data: StickerEvent;
};

export const StickerRow: React.FC<Props> = ({ data }) => {
  const handleClick = useUserPopoverDispatch({
    id: data.from,
    label: data.fromLabel,
  });

  return (
    <div
      className={`my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-purple-400 to-violet-400 shadow-lg shadow-violet-300/60 border border-violet-300 transform hover:scale-[1.02] transition-all duration-200`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg mr-1">🎲</span>
          <span className="font-bold text-violet-900 text-base">스티커</span>
        </div>

        <span className="text-xl px-2 bg-purple-500 py-0.5 rounded-lg shadow-sm text-white">
          {data.amount}개
        </span>
      </div>

      {/* 후원자 정보 */}
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-violet-700 font-medium">후원자:</span>
          <span
            onClick={handleClick}
            className="cursor-pointer text-violet-800 text-md bg-purple-200/60 px-2 py-0.5 rounded-lg"
          >
            {data.fromLabel}
          </span>
        </div>
      </div>

      {data.supporterOrdinal > 0 && (
        <div className="w-full text-xs bg-violet-500 text-white mt-2 px-2 py-1 rounded-full font-bold">
          🎉 서포터 가입 ({data.supporterOrdinal}번째)
        </div>
      )}
    </div>
  );
};
