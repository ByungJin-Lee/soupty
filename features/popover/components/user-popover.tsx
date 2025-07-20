"use client";

import { Star } from "react-feather";
import {
  PopoverContentProps,
  PopoverId,
  withPopover,
} from "~/common/ui/popover";
import { isTargetUser } from "~/common/utils/target-users";
import { useUserPopover } from "../hooks/user-popover";
import { UserPopoverPayload } from "../types/user";

const UserPopoverContent: React.FC<PopoverContentProps<UserPopoverPayload>> = ({
  payload,
}) => {
  const { userInfo, isLoading, handleToggleTargetUser } =
    useUserPopover(payload);

  const isTarget = userInfo.userId ? isTargetUser(userInfo.userId) : false;

  return (
    <div className="p-3 min-w-[200px]">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">{userInfo.label}</h3>
          <p className="text-sm text-gray-500">{userInfo.userId}</p>
        </div>
        <button
          onClick={handleToggleTargetUser}
          disabled={isLoading}
          className={`p-1 rounded-md transition-colors border border-gray-300 text-gray-500 ${
            isTarget ? "" : ""
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Star
            size={20}
            fill={isTarget ? "yellow" : "none"}
            fillOpacity={0.5}
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
    </div>
  );
};

export const UserPopover = withPopover(UserPopoverContent, PopoverId.UserInfo);
