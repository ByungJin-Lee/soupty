import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import {
  BlackEvent,
  FreezeEvent,
  freezeTargetLabel,
  KickCancelEvent,
  KickEvent,
  MuteEvent,
  SlowEvent,
} from "~/types";
import { formatDuration, getSeverityColor } from "../../utils/time-utils";

type KickProps = {
  data: KickEvent;
};

type KickCancelProps = {
  data: KickCancelEvent;
};

type MuteProps = {
  data: MuteEvent;
};

type BlackProps = {
  data: BlackEvent;
};

type FreezeProps = {
  data: FreezeEvent;
};

type SlowProps = {
  data: SlowEvent;
};

export const KickRow: React.FC<KickProps> = ({ data }) => {
  const handleClick = useUserPopoverDispatch(data.user);
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-red-400 via-red-500 to-red-600 shadow-lg shadow-red-200/50 border border-red-300 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-800 shadow-inner"></div>
          <span className="font-semibold text-red-100 text-sm">강퇴</span>
        </div>
        <span
          onClick={handleClick}
          className="font-bold cursor-pointer text-red-100 text-sm bg-red-600/60 px-2 py-1 rounded-lg"
        >
          {data.user.label}
        </span>
      </div>
    </div>
  );
};

export const KickCancelRow: React.FC<KickCancelProps> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 shadow-lg shadow-green-200/50 border border-green-300 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-800 shadow-inner"></div>
          <span className="font-semibold text-green-100 text-sm">
            강퇴 해제
          </span>
        </div>
        <span className="font-bold text-green-100 text-sm bg-green-600/60 px-2 py-1 rounded-lg">
          {data.userId}
        </span>
      </div>
    </div>
  );
};

export const MuteRow: React.FC<MuteProps> = ({ data }) => {
  const handleClick = useUserPopoverDispatch(data.user);

  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-red-700 via-red-800 to-rose-800 shadow-lg shadow-red-400/30 border border-red-600 transform hover:scale-[1.02] transition-all duration-200">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-red-100 text-base">채팅 금지</span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-red-200 bg-red-900/60 px-2 py-0.5 rounded">
            {data.counts}회
          </span>
          <span
            className={`text-sm font-bold text-red-100 px-3 py-0.5 rounded-lg ${getSeverityColor(
              data.seconds
            )}`}
          >
            {formatDuration(data.seconds)}
          </span>
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-300">대상:</span>
          <span
            className="font-semibold underline cursor-pointer text-red-100 text-sm bg-red-600/70 px-3 py-0.5 rounded-lg"
            onClick={handleClick}
          >
            {data.user.label}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-red-300">처리자:</span>
          <span className="text-sm text-red-100 bg-red-600/60 px-2 py-0.5 rounded">
            {data.by}
          </span>
        </div>
      </div>
    </div>
  );
};

export const BlackRow: React.FC<BlackProps> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-gray-800 via-black to-gray-900 shadow-lg shadow-gray-400/50 border border-gray-600 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-300 shadow-inner"></div>
          <span className="font-semibold text-white text-sm">블랙</span>
        </div>
        <span className="font-bold text-white text-sm bg-gray-700/60 px-2 py-1 rounded-lg">
          {data.userId}
        </span>
      </div>
    </div>
  );
};

export const FreezeRow: React.FC<FreezeProps> = ({ data }) => {
  return (
    <div
      className={`my-1 mx-2 p-3 rounded-xl ${
        data.freezed
          ? "bg-gradient-to-r from-red-400 via-orange-500 to-red-500 shadow-red-300/50 border-red-400"
          : "bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 shadow-green-200/50 border-green-300"
      } shadow-lg border transform hover:scale-[1.02] transition-all duration-200`}
    >
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              data.freezed ? "bg-red-900" : "bg-green-800"
            } shadow-inner`}
          ></div>
          <span
            className={`font-semibold ${
              data.freezed ? "text-red-100" : "text-green-100"
            } text-sm`}
          >
            {data.freezed ? "채팅 제한" : "채팅 제한 해제"}
          </span>
        </div>
      </div>
      {data.freezed && (
        <div className="text-center text-sm font-medium">
          <span className="text-red-100 bg-red-600/70 px-2 py-1 rounded-lg mt-2">
            구독 {data.limitSubscriptionMonth}개월, 별풍선 {data.limitBalloons}
            개 이상
          </span>
          {data.targets.length > 0 ? (
            <div className="text-white font-light bg-red-700/50 px-2 py-1 rounded-lg mt-2">
              {data.targets.map((v) => freezeTargetLabel[v]).join("  ")}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const SlowRow: React.FC<SlowProps> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg shadow-orange-300/50 border border-orange-400 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-900 shadow-inner"></div>
          <span className="font-semibold text-red-100 text-sm">
            슬로우 모드
          </span>
        </div>
        <span className="font-bold text-red-100 text-sm bg-red-700/60 px-2 py-1 rounded-lg">
          {data.duration}초
        </span>
      </div>
    </div>
  );
};
