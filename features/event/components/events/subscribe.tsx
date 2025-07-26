import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { SubscribeEvent } from "~/types";

type Props = {
  data: SubscribeEvent;
};

export const SubscribeRow: React.FC<Props> = ({ data }) => {
  const handleClick = useUserPopoverDispatch({
    id: data.userId,
    label: data.label,
  });

  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 shadow-lg shadow-pink-200/50 border border-rose-200 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-600 shadow-inner"></div>
          <span className="font-semibold text-rose-900 text-sm">구독</span>
        </div>
        <span
          onClick={handleClick}
          className="font-bold cursor-pointer text-rose-800 text-sm bg-pink-200/60 px-2 py-1 rounded-lg"
        >
          {data.label}
        </span>
      </div>
      <div className="flex justify-end">
        <span className="text-lg font-bold text-rose-900 bg-pink-100/80 px-3 py-1 rounded-lg shadow-sm">
          {data.tier}티어 {data.renew === 0 ? "신규 가입" : `${data.renew}개월`}
        </span>
      </div>
    </div>
  );
};
