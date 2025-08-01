/**
 * targetUsers localStorage 관리 유틸리티
 */

import { ipcService } from "~/services/ipc";
import { TargetUser } from "~/services/ipc/types";

const TARGET_USERS_KEY = "targetUsers";

type TargetUserCached = Record<string, TargetUser>;

// 메모리 캐시 (Set 사용)
let cachedTargetUsers: TargetUserCached | null = null;

/**
 * localStorage에서 targetUsers Set을 가져옵니다 (캐시 사용)
 */
export const getTargetUsers = (): TargetUserCached => {
  // 캐시가 있으면 바로 반환
  if (cachedTargetUsers !== null) {
    return cachedTargetUsers;
  }

  try {
    const stored = localStorage.getItem(TARGET_USERS_KEY);
    cachedTargetUsers = stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error(
      "로컬스토리지에서 TargetUser 데이터를 읽을 수 없습니다.",
      error
    );
    cachedTargetUsers = {};
  }
  return cachedTargetUsers!;
};

/**
 * localStorage에 targetUsers를 저장합니다
 */
export const setTargetUsers = (targetUsers: TargetUser[]): void => {
  try {
    const data = targetUsers.reduce<TargetUserCached>((acc, v) => {
      acc[v.userId] = v;
      return acc;
    }, {});
    updateTargetUserCache(data);
  } catch (error) {
    console.error("Failed to save targetUsers to localStorage:", error);
  }
};

const updateTargetUserCache = (cache: TargetUserCached): void => {
  localStorage.setItem(TARGET_USERS_KEY, JSON.stringify(cache));
  cachedTargetUsers = cache;
};

/**
 * targetUsers에 사용자를 추가합니다 (백엔드와 동기화)
 */
export const addTargetUser = async (user: TargetUser) => {
  try {
    const cache = getTargetUsers();

    if (user.userId in cache) return;

    // 백엔드에 추가 요청
    await ipcService.targetUsers.addTargetUser(user);
    // 로컬 캐시 업데이트
    cache[user.userId] = user;
    updateTargetUserCache(cache);
  } catch (error) {
    console.error("Failed to add target user:", error);
    throw error;
  }
};

/**
 * targetUsers에서 사용자를 제거합니다 (백엔드와 동기화)
 */
export const removeTargetUser = async (userId: string) => {
  try {
    // 백엔드에 제거 요청
    await ipcService.targetUsers.removeTargetUser(userId);

    // 로컬 캐시 업데이트
    const current = getTargetUsers();
    if (userId in current) {
      delete current[userId];
      updateTargetUserCache(current);
    }
  } catch (error) {
    console.error("Failed to remove target user:", error);
    throw error;
  }
};

/**
 * 캐시를 강제로 무효화합니다 (테스트나 디버깅용)
 */
export const clearCache = () => {
  cachedTargetUsers = null;
};

/**
 * 특정 사용자가 targetUsers에 포함되어 있는지 확인합니다
 */
export const isTargetUser = (userId: string): boolean => {
  const targetUsers = getTargetUsers();
  return userId in targetUsers;
};
