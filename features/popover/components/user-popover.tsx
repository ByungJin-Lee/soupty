"use client";

import { useRouter } from "next/navigation";
import { Star } from "react-feather";
import { ClipboardButton } from "~/common/ui/clipboard-button";
import {
  PopoverContentProps,
  PopoverId,
  withPopover,
} from "~/common/ui/popover";
import { isTargetUser } from "~/common/utils/target-users";
import { route } from "~/constants";
import { useLiveUserHistoryStore } from "~/features/live/stores/live-user-history";
import { useChannel } from "~/features/soop";
import { useUserPopover } from "../hooks/user-popover";
import { UserPopoverPayload } from "../types/user";

const UserPopoverContent: React.FC<PopoverContentProps<UserPopoverPayload>> = ({
  payload,
}) => {
  const { userInfo, isLoading, handleToggleTargetUser } =
    useUserPopover(payload);
  const router = useRouter();
  const openLiveUserHistory = useLiveUserHistoryStore((v) => v.open);
  const currentChannel = useChannel((v) => v.channel);
  const openWholeUserHistory = (userId: string) => {
    const channelQuery = currentChannel
      ? `&channelId=${currentChannel.id}`
      : "";
    router.push(`${route.history}?type=user&userId=${userId}${channelQuery}`);
  };

  const isTarget = userInfo.userId ? isTargetUser(userInfo.userId) : false;

  return (
    <div className="p-3 min-w-[200px]">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">{userInfo.label}</h3>
          <p className="text-sm text-gray-500">
            {userInfo.userId}
            <ClipboardButton value={userInfo.userId} />
          </p>
        </div>
        <button
          onClick={handleToggleTargetUser}
          disabled={isLoading}
          className={`p-1 rounded-md transition-colors border border-gray-300 text-gray-500 ${
            isTarget ? "" : ""
          } ${isLoading ? "cursor-not-allowed" : ""}`}
        >
          <Star
            size={20}
            fill={isTarget ? "yellow" : "none"}
            fillOpacity={0.9}
            strokeWidth={1.2}
          />
        </button>
      </div>

      <div className="space-y-2 mt-3">
        {userInfo.isBj && (
          <div className="px-3 py-2 bg-yellow-50 text-yellow-700 text-sm rounded-md border border-yellow-200">
            방송자 (BJ)
          </div>
        )}

        <div className="text-sm rounded-md flex flex-wrap gap-1">
          {userInfo.isManager && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-sm rounded-md border border-purple-200">
              매니저
            </span>
          )}

          {userInfo.isTopFan && (
            <span className="px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200">
              열혈
            </span>
          )}
          {userInfo.isFan && !userInfo.isTopFan && (
            <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded border border-pink-200">
              팬
            </span>
          )}
          {userInfo.isFollower ? (
            <span
              className={`px-2 py-1 rounded border ${
                userInfo.isFollowPlus
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {userInfo.isFollowPlus ? "팔로우+" : "팔로우"}
            </span>
          ) : null}
          {userInfo.isSupporter && (
            <span className="px-2 py-1 bg-orange-50 rounded text-orange-700 text-sm border border-orange-200">
              서포터
            </span>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 mt-2">
        <p
          className="cursor-pointer py-1 px-1 text-sm text-gray-600 hover:bg-gray-200"
          onClick={() => openLiveUserHistory(userInfo.userId, userInfo.label)}
        >
          라이브 기록
        </p>
        <p
          className="cursor-pointer py-1 px-1 text-sm text-gray-600 hover:bg-gray-200"
          onClick={() => openWholeUserHistory(userInfo.userId)}
        >
          전체 기록
        </p>
      </div>
    </div>
  );
};

export const UserPopover = withPopover(UserPopoverContent, PopoverId.UserInfo);
