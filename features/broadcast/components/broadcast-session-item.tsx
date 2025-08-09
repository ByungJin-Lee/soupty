"use client";

import { formatTimestamp } from "~/features/history/utils/format";
import { ChannelAvatar } from "~/features/soop/components/channel/channel-avatar";
import { BroadcastSession } from "~/services/ipc/types";

interface BroadcastSessionItemProps {
  session: BroadcastSession;
  onSelect: (session: BroadcastSession) => void;
}

export const BroadcastSessionItem: React.FC<BroadcastSessionItemProps> = ({
  session,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(session)}
      className="group relative bg-white border-gray-200 border-2 rounded-xl hover:border-blue-200 hover:shadow-lg cursor-pointer transition-all duration-300 overflow-hidden"
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <ChannelAvatar
            channel={{ id: session.channelId }}
            size={60}
            className="rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-900 group-hover:text-blue-700 text-base leading-tight line-clamp-2 transition-colors duration-200">
                {session.title}
              </h3>
              {!session.endedAt && (
                <div className="flex-shrink-0 ml-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-red-600">
                      LIVE
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start justify-between">
              <div className="text-sm text-gray-600 font-medium">
                {session.channelName}
              </div>

              <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
                <div>
                  <span className="font-medium">시작:</span>{" "}
                  {formatTimestamp(session.startedAt)}
                </div>
                {session.endedAt && (
                  <div>
                    <span className="font-medium">종료:</span>{" "}
                    {formatTimestamp(session.endedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
  );
};
