import {
  BattleMissionResultEvent,
  ChallengeMissionResultEvent,
  MissionDonationEvent,
  MissionTotalEvent,
  MissionType,
} from "~/types";

type MissionDonationProps = {
  data: MissionDonationEvent;
};

type MissionTotalProps = {
  data: MissionTotalEvent;
};

type ChallengeMissionResultProps = {
  data: ChallengeMissionResultEvent;
};

type BattleMissionResultProps = {
  data: BattleMissionResultEvent;
};

export const MissionDonationRow: React.FC<MissionDonationProps> = ({
  data,
}) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 shadow-lg shadow-purple-200/50 border border-purple-300 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-800 shadow-inner"></div>
          <span className="font-semibold text-purple-100 text-sm">
            {data.missionType === MissionType.Battle
              ? "배틀 미션 후원"
              : "도전 미션 후원"}
          </span>
        </div>
        <span className="font-bold text-purple-100 text-sm bg-purple-600/60 px-2 py-1 rounded-lg">
          {data.fromLabel}
        </span>
        <span className="text-sm font-bold text-purple-100 bg-purple-500/60 px-2 py-1 rounded-lg">
          {data.amount}개
        </span>
      </div>
    </div>
  );
};

export const MissionTotalRow: React.FC<MissionTotalProps> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300 shadow-lg shadow-purple-200/50 border border-purple-200 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-700 shadow-inner"></div>
          <span className="font-semibold text-purple-900 text-sm">
            미션 총합
          </span>
        </div>
        <span className="font-bold text-purple-900 text-sm bg-purple-100/60 px-2 py-1 rounded-lg">
          {data.missionType}
        </span>
      </div>
      <div className="flex justify-end">
        <span className="text-lg font-bold text-purple-900 bg-purple-100/80 px-3 py-1 rounded-lg shadow-sm">
          {data.amount}개
        </span>
      </div>
    </div>
  );
};

export const ChallengeMissionResultRow: React.FC<
  ChallengeMissionResultProps
> = ({ data }) => {
  return (
    <div
      className={`my-1 mx-2 p-3 rounded-xl ${
        data.isSuccess
          ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-green-200/50 border-green-400"
          : "bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 shadow-red-200/50 border-red-400"
      } shadow-lg border transform hover:scale-[1.02] transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              data.isSuccess ? "bg-green-800" : "bg-red-800"
            } shadow-inner`}
          ></div>
          <span className="font-semibold text-white text-sm">챌린지 미션</span>
        </div>
        <span
          className={`font-bold text-white text-sm ${
            data.isSuccess ? "bg-green-600/60" : "bg-red-600/60"
          } px-2 py-1 rounded-lg`}
        >
          {data.isSuccess ? "성공" : "실패"}
        </span>
      </div>
      <div className="text-center">
        <span
          className={`text-sm font-medium text-white ${
            data.isSuccess ? "bg-green-500/60" : "bg-red-500/60"
          } px-2 py-1 rounded-lg`}
        >
          {data.title}
        </span>
      </div>
    </div>
  );
};

export const BattleMissionResultRow: React.FC<BattleMissionResultProps> = ({
  data,
}) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 shadow-lg shadow-amber-200/50 border border-amber-300 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-800 shadow-inner"></div>
          <span className="font-semibold text-white text-sm">배틀 미션</span>
        </div>
        <span className="font-bold text-white text-sm bg-amber-600/60 px-2 py-1 rounded-lg">
          {data.isDraw ? "무승부" : `${data.winner} 승리`}
        </span>
      </div>
      <div className="text-center">
        <span className="text-sm font-medium text-white bg-amber-500/60 px-2 py-1 rounded-lg">
          {data.title}
        </span>
      </div>
    </div>
  );
};
