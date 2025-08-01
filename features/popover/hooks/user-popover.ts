import { useCallback, useMemo, useState } from "react";
import { PopoverId, usePopoverStore } from "~/common/stores/popover-store";
import {
  addTargetUser,
  isTargetUser,
  removeTargetUser,
} from "~/common/utils/target-users";
import { UserPopoverPayload } from "../types/user";

export const useUserPopover = (payload: UserPopoverPayload) => {
  const [isLoading, setIsLoading] = useState(false);

  // 계산된 값들을 메모화
  const userInfo = useMemo(() => {
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
