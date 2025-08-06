import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { useChannel } from "~/features/soop";
import { DonationEvent, DonationType } from "~/types";
import {
  getAmountColor,
  getDonationTypeIcon,
} from "../../utils/donation-utils";

type Props = {
  data: DonationEvent;
};

export const DonationRow: React.FC<Props> = ({ data }) => {
  const channel = useChannel((v) => v.channel);
  const isSpecialEvent = data.becomeTopFan || data.fanClubOrdinal > 0;
  const handleClick = useUserPopoverDispatch({
    id: data.from,
    label: data.fromLabel,
    channelId: channel?.id,
  });

  return (
    <div
      className={`my-1 mx-2 p-3 rounded-xl ${
        isSpecialEvent
          ? "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 shadow-lg shadow-orange-300/60 border border-orange-300"
          : "bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 shadow-lg shadow-amber-200/50 border border-orange-200"
      } transform hover:scale-[1.02] transition-all duration-200`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg mr-1">
            {getDonationTypeIcon(data.donationType)}
          </span>
          <span className="font-bold text-orange-900 text-base">별풍선</span>
          {data.donationType === DonationType.ADBalloon && (
            <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
              광고
            </span>
          )}
        </div>

        <span
          className={`text-xl px-2 py-0.5 rounded-lg shadow-sm ${getAmountColor(
            data.amount
          )}`}
        >
          {data.amount}개
        </span>
      </div>

      {/* 후원자 정보 */}
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-orange-700 font-medium">후원자:</span>
          <span
            onClick={handleClick}
            className="cursor-pointer text-orange-800 text-md bg-yellow-200/60 px-2 py-0.5 rounded-lg"
          >
            {data.fromLabel}
          </span>
        </div>
      </div>

      {data.becomeTopFan && (
        <div className="w-full text-xs bg-red-500 text-white mt-2 px-2 py-1 rounded-full font-bold animate-bounce">
          🔥 열혈팬!
        </div>
      )}
      {data.fanClubOrdinal > 0 && (
        <div className="w-full text-xs bg-pink-500 text-white mt-2 px-2 py-1 rounded-full font-bold">
          {data.fanClubOrdinal > 0
            ? `🎉 팬 가입(${data.fanClubOrdinal}번째)`
            : ""}
        </div>
      )}

      {/* 메시지 */}
      {data.message && (
        <div className="bg-yellow-100/80 rounded-lg mt-2 px-2 py-0.5 border border-yellow-300/60">
          <p className="text-orange-800 text-sm font-medium leading-relaxed">
            &ldquo;{data.message}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};
