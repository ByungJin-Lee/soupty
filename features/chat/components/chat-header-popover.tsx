"use client";

import {
  PopoverContentProps,
  PopoverId,
  withPopover,
} from "~/common/ui/popover";
import { isTargetUser } from "~/common/utils/target-users";
import { ChatEvent } from "~/types";
import { useChatHeaderPopover } from "../hooks";

const ChatHeaderPopoverContent: React.FC<PopoverContentProps<ChatEvent>> = ({
  payload,
}) => {
  const { userInfo, isLoading, handleToggleTargetUser } =
    useChatHeaderPopover(payload);

  const isTarget = userInfo.userId ? isTargetUser(userInfo.userId) : false;

  return (
    <div className="p-4 min-w-[200px]">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900">{userInfo.label}</h3>
        <p className="text-sm text-gray-500">ID: {userInfo.userId}</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleToggleTargetUser}
          disabled={isLoading}
          className={`w-full px-3 py-1 text-sm rounded-md font-medium transition-colors ${
            isTarget
              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading
            ? "처리 중..."
            : isTarget
            ? "타겟 사용자에서 제거"
            : "타겟 사용자로 추가"}
        </button>

        {userInfo.isBj && (
          <div className="px-3 py-2 bg-yellow-50 text-yellow-700 text-sm rounded-md border border-yellow-200">
            방송자 (BJ)
          </div>
        )}

        <div className="text-sm rounded-md flex flex-wrap gap-1">
          {userInfo.isManager && (
            <div className="px-2 py-1 bg-purple-50 text-purple-700 text-sm rounded-md border border-purple-200">
              매니저
            </div>
          )}

          {userInfo.isTopFan && (
            <span className="px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200">
              열혈 팬
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
              {userInfo.isFollowPlus ? "팔로우 플러스" : "팔로우"}
            </span>
          ) : null}
        </div>

        {userInfo.isSupporter && (
          <div className="px-3 py-2 bg-orange-50 text-orange-700 text-sm rounded-md border border-orange-200">
            서포터
          </div>
        )}
      </div>
    </div>
  );
};

export const ChatHeaderPopover = withPopover(
  ChatHeaderPopoverContent,
  PopoverId.ChatHeader
);
