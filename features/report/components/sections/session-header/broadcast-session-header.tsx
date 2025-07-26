import { useRouter } from "next/navigation";
import { confirm } from "~/common/stores/confirm-modal-store";
import { formatTimestamp } from "~/common/utils/format";
import { route } from "~/constants";
import { useBroadcastSessionEndTime } from "~/features/report/hooks";
import { ChannelAvatar } from "~/features/soop/components/channel/channel-avatar";
import { deleteBroadcastSession } from "~/services/ipc/broadcast-session";
import { BroadcastSession } from "~/services/ipc/types";

type Props = {
  session: BroadcastSession;
};

export const BroadcastSessionHeader: React.FC<Props> = ({ session }) => {
  const {
    isEditingEndTime,
    endTime,
    setEndTime,
    handleSetEndTime,
    handleSaveEndTime,
    handleCancelEdit,
  } = useBroadcastSessionEndTime(session);

  const router = useRouter();

  const handleDeleteSession = async () => {
    const confirmed = await confirm(
      "방송 세션 삭제",
      "이 방송 세션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );

    if (confirmed) {
      try {
        deleteBroadcastSession(session.id).then(() => {
          router.push(route.broadcast);
        });
      } catch (error) {
        console.error("Failed to delete session:", error);
        alert("세션 삭제에 실패했습니다.");
      }
    }
  };

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
          <div className="flex items-center gap-3">
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
            <button
              onClick={handleDeleteSession}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded-lg border border-red-200 transition-colors flex items-center"
            >
              🗑️ 삭제
            </button>
          </div>
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
          <div className="space-y-1">
            <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center justify-between">
              종료 시간
              {!isEditingEndTime && (
                <button
                  onClick={handleSetEndTime}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors"
                >
                  {session.endedAt ? "수정" : "설정"}
                </button>
              )}
            </dt>
            {session.endedAt || isEditingEndTime ? (
              <dd className="text-lg text-gray-900 bg-red-50 px-3 py-1 rounded-md border border-red-200">
                {isEditingEndTime ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      value={endTime.slice(0, 16)}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 flex-1"
                    />
                    <button
                      onClick={handleSaveEndTime}
                      className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <span className="font-medium">
                    🕐 {formatTimestamp(session.endedAt!)}
                  </span>
                )}
              </dd>
            ) : (
              <dd className="text-lg text-gray-500 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                <span className="font-medium italic">미설정</span>
              </dd>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
