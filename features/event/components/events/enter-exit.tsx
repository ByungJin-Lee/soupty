import { EnterEvent, ExitEvent } from "~/types";

type EnterProps = {
  data: EnterEvent;
};

type ExitProps = {
  data: ExitEvent;
};

export const EnterRow: React.FC<EnterProps> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 shadow-lg shadow-green-200/50 border border-emerald-200 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-600 shadow-inner"></div>
          <span className="font-semibold text-green-900 text-sm">입장</span>
        </div>
        <span className="font-bold text-green-800 text-sm bg-emerald-100/60 px-2 py-1 rounded-lg">
          {data.user.label}
        </span>
      </div>
    </div>
  );
};

export const ExitRow: React.FC<ExitProps> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-slate-300 via-gray-300 to-zinc-300 shadow-lg shadow-gray-200/50 border border-slate-200 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-600 shadow-inner"></div>
          <span className="font-semibold text-gray-900 text-sm">퇴장</span>
        </div>
        <span className="font-bold text-gray-800 text-sm bg-slate-100/60 px-2 py-1 rounded-lg">
          {data.user.label}
        </span>
      </div>
    </div>
  );
};