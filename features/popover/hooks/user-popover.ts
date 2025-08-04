import { openUrl } from "@tauri-apps/plugin-opener";
import { useCallback, useMemo, useState } from "react";
import { PopoverId, usePopoverStore } from "~/common/stores/popover-store";
import {
  addTargetUser,
  isTargetUser,
  removeTargetUser,
} from "~/common/utils/target-users";
import { API_ENDPOINTS } from "~/constants";
import { openHistory } from "~/features/history/utils/opener";
import { useLiveUserHistoryStore } from "~/features/live/stores/live-user-history";
import { useChannel } from "~/features/soop";
import { UserPopoverPayload } from "../types/user";

interface UserInfo {
  userId: string;
  isManager: boolean;
  label: string;
  isFollower: boolean | 0;
  isFollowPlus: boolean;
  isFollowBasic: boolean;
  isBj: boolean;
  isTopFan: boolean;
  isFan: boolean;
  isSupporter: boolean;
}

export const useUserPopover = (payload: UserPopoverPayload) => {
  const [isLoading, setIsLoading] = useState(false);

  // 계산된 값들을 메모화
  const userInfo = useMemo<UserInfo>(() => {
    const userId = payload.id;
    const isManager = payload.status?.isManager || false;

    // 구독 관련 정보
    const followStatus = payload.status?.follow || 0;
    const isFollower = followStatus && followStatus > 0;
    const isFollowPlus = followStatus === 2;
    const isFollowBasic = followStatus === 1;

    // 기타 사용자 상태
    const isBj = payload.status?.isBj || false;
    const isTopFan = payload.status?.isTopFan || false;
    const isFan = payload.status?.isFan || false;
    const isSupporter = payload.status?.isSupporter || false;

    return {
      userId,
      isManager,
      label: payload.label,
      isFollower,
      isFollowPlus,
      isFollowBasic,
      isBj,
      isTopFan,
      isFan,
      isSupporter,
    };
  }, [payload]);

  const handleToggleTargetUser = useCallback(async () => {
    if (!userInfo.userId) return;

    setIsLoading(true);
    try {
      if (isTargetUser(userInfo.userId)) {
        await removeTargetUser(userInfo.userId);
      } else {
        await addTargetUser({
          userId: userInfo.userId,
          username: userInfo.label,
        });
      }
    } catch (error) {
      console.error("Failed to toggle target user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo.userId]);

  return {
    userInfo,
    isLoading,
    handleToggleTargetUser,
  };
};

export const useUserPopoverDispatch = (
  user?: UserPopoverPayload | null,
  partial?: Partial<UserPopoverPayload>
) => {
  const togglePopover = usePopoverStore((t) => t.togglePopover);

  return useCallback(
    (event: React.MouseEvent) => {
      if (!user) return;

      togglePopover(
        PopoverId.UserInfo,
        user.id,
        event,
        partial ? mergeUserPopoverPayload(user, partial) : user
      );
    },
    [user, partial, togglePopover]
  );
};

const mergeUserPopoverPayload = (
  value: UserPopoverPayload,
  partial: Partial<UserPopoverPayload>
): UserPopoverPayload => ({ ...value, ...partial });

export const useUserPopoverHandler = (
  userInfo: UserInfo,
  payload: UserPopoverPayload
) => {
  const currentChannel = useChannel((v) => v.channel);
  // 사용자 실시간 기록
  const openLiveUserHistory = useLiveUserHistoryStore((v) => v.open).bind(
    null,
    userInfo.userId,
    userInfo.label
  );
  // 사용자 전체 기록
  const openWholeUserHistory = () => {
    openHistory({
      type: "user",
      userId: userInfo.userId,
      channelId: currentChannel?.id,
      sessionId: payload.broadcastSessionId,
    });
  };
  // 방송국 바로가기
  const openUserPage = () => openUrl(API_ENDPOINTS.USER_PAGE(userInfo.userId));

  return {
    openWholeUserHistory,
    openLiveUserHistory,
    openUserPage,
  };
};
