import { formatTimestamp } from "~/common/utils/format";
import { ChannelAvatar } from "~/features/soop/components/channel/channel-avatar";
import { BroadcastSession } from "~/services/ipc/types";

type Props = {
  session: BroadcastSession;
};

export const BroadcastSessionHeader: React.FC<Props> = ({ session }) => {
  return (
    <div>
      {/* 헤더 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{session.title}</h1>
          {!session.endedAt && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              진행 중
            </span>
          )}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">세션 ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">
              {session.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">채널명</dt>
            <dd className="mt-1 text-sm text-gray-900 flex gap-1 items-center">
              <ChannelAvatar
                channel={{ id: session.channelId }}
                size={24}
                className="rounded-full"
              />
              <span>{session.channelName}</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">시작 시간</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatTimestamp(session.startedAt)}
            </dd>
          </div>
          {session.endedAt && (
            <div>
              <dt className="text-sm font-medium text-gray-500">종료 시간</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatTimestamp(session.endedAt)}
              </dd>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
