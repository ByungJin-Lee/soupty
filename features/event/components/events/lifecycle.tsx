import { ConnectedEvent, DisconnectedEvent, BJStateChangeEvent } from "~/types";

type ConnectedProps = {
  data: ConnectedEvent;
};

type DisconnectedProps = {
  data: DisconnectedEvent;
};

type BJStateChangeProps = {
  data: BJStateChangeEvent;
};

export const ConnectedRow: React.FC<ConnectedProps> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 shadow-lg shadow-emerald-200/50 border border-emerald-300 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-800 shadow-inner animate-pulse"></div>
          <span className="font-semibold text-emerald-100 text-sm">연결됨</span>
        </div>
      </div>
    </div>
  );
};

export const DisconnectedRow: React.FC<DisconnectedProps> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-gray-500 via-slate-500 to-zinc-500 shadow-lg shadow-gray-300/50 border border-gray-400 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-200 shadow-inner"></div>
          <span className="font-semibold text-white text-sm">연결 해제됨</span>
        </div>
      </div>
    </div>
  );
};

export const BJStateChangeRow: React.FC<BJStateChangeProps> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 shadow-lg shadow-cyan-200/50 border border-cyan-300 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-800 shadow-inner"></div>
          <span className="font-semibold text-cyan-100 text-sm">BJ 상태 변경</span>
        </div>
      </div>
    </div>
  );
};