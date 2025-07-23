import { formatTimestamp } from "~/common/utils/format";
import { ChannelAvatar } from "~/features/soop/components/channel/channel-avatar";
import { BroadcastSession } from "~/services/ipc/types";

type Props = {
  session: BroadcastSession;
};

export const BroadcastSessionHeader: React.FC<Props> = ({ session }) => {
  return (
    <div className="space-y-4  mb-4">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-lg mr-3">
              📺
            </span>
            {session.title}
          </h1>
          {!session.endedAt && (
            <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full border border-green-200 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              진행 중
            </span>
          )}
          {session.endedAt && (
            <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full border border-gray-200 flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              종료됨
            </span>
          )}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm mr-2">
            ℹ️
          </span>
          방송 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              세션 ID
            </dt>
            <dd className="text-lg font-mono text-gray-900 bg-gray-50 px-3 py-1 rounded-md border border-gray-300">
              #{session.id}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              채널명
            </dt>
            <dd className="text-lg text-gray-900 flex gap-2 items-center bg-gray-50 px-3 py-1 rounded-md border border-gray-300">
              <ChannelAvatar
                channel={{ id: session.channelId }}
                size={28}
                className="rounded-full border-2 border-white shadow-sm"
              />
              <span className="font-medium">{session.channelName}</span>
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              시작 시간
            </dt>
            <dd className="text-lg text-gray-900 bg-green-50 px-3 py-1 rounded-md border border-green-200">
              <span className="font-medium">
                🕐 {formatTimestamp(session.startedAt)}
              </span>
            </dd>
          </div>
          {session.endedAt && (
            <div className="space-y-1">
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                종료 시간
              </dt>
              <dd className="text-lg text-gray-900 bg-red-50 px-3 py-1 rounded-md border border-red-200">
                <span className="font-medium">
                  🕐 {formatTimestamp(session.endedAt)}
                </span>
              </dd>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
