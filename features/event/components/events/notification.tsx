import { NotificationEvent } from "~/types";

type Props = {
  data: NotificationEvent;
};

export const NotificationRow: React.FC<Props> = ({ data }) => {
  return (
    <div className="my-1 mx-2 p-3 rounded-xl bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 shadow-lg shadow-indigo-200/50 border border-indigo-300 transform hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-800 shadow-inner"></div>
          <span className="font-semibold text-indigo-100 text-sm">알림</span>
        </div>
        <span
          className={`font-bold text-indigo-100 text-sm px-2 py-1 rounded-lg ${
            data.show ? "bg-indigo-600/60" : "bg-gray-600/60"
          }`}
        >
          {data.show ? "표시" : "숨김"}
        </span>
      </div>

      <pre className="text-xs font-medium text-indigo-100 bg-indigo-500/60 px-2 py-1 rounded-lg whitespace-pre-wrap">
        {data.message}
      </pre>
    </div>
  );
};
