import { useCallback, useMemo, useState } from "react";
import {
  addTargetUser,
  isTargetUser,
  removeTargetUser,
} from "~/common/utils/target-users";
import { ChatEvent } from "~/types";

export function useChatHeaderPopover(chatData: ChatEvent) {
  const [isLoading, setIsLoading] = useState(false);

  // 계산된 값들을 메모화
  const userInfo = useMemo(() => {
    const userId = chatData.user?.id || "";
    const isManager = chatData.user?.status?.isManager || false;

    // 구독 관련 정보
    const followStatus = chatData.user?.status?.follow;
    const isFollower = followStatus && followStatus > 0;
    const isFollowPlus = followStatus === 2;
    const isFollowBasic = followStatus === 1;

    // 기타 사용자 상태
    const isBj = chatData.user?.status?.isBj || false;
    const isTopFan = chatData.user?.status?.isTopFan || false;
    const isFan = chatData.user?.status?.isFan || false;
    const isSupporter = chatData.user?.status?.isSupporter || false;

    return {
      userId,
      isManager,
      label: chatData.user?.label || "",
      isFollower,
      isFollowPlus,
      isFollowBasic,
      isBj,
      isTopFan,
      isFan,
      isSupporter,
    };
  }, [chatData]);

  const handleToggleTargetUser = useCallback(async () => {
    if (!userInfo.userId) return;

    setIsLoading(true);
    try {
      if (isTargetUser(userInfo.userId)) {
        await removeTargetUser(userInfo.userId);
      } else {
        await addTargetUser(userInfo.userId);
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
}
