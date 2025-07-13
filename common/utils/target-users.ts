/**
 * targetUsers localStorage 관리 유틸리티
 */

import { ipcService } from "~/services/ipc";

const TARGET_USERS_KEY = "targetUsers";

// 메모리 캐시 (Set 사용)
let cachedTargetUsers: Set<string> | null = null;

/**
 * localStorage에서 targetUsers Set을 가져옵니다 (캐시 사용)
 */
export function getTargetUsers(): Set<string> {
  // 캐시가 있으면 바로 반환
  if (cachedTargetUsers !== null) {
    return cachedTargetUsers;
  }

  try {
    const stored = localStorage.getItem(TARGET_USERS_KEY);
    const usersArray = stored ? JSON.parse(stored) : [];
    
    // Set으로 변환하고 캐시에 저장
    cachedTargetUsers = new Set(usersArray);
    return cachedTargetUsers;
  } catch (error) {
    console.error("Failed to parse targetUsers from localStorage:", error);
    
    // 오류 시 빈 Set을 캐시에 저장
    cachedTargetUsers = new Set();
    return cachedTargetUsers;
  }
}

/**
 * localStorage에 targetUsers를 저장합니다
 */
export function setTargetUsers(userIds: string[] | Set<string>): void {
  try {
    const usersArray = Array.isArray(userIds) ? userIds : Array.from(userIds);
    localStorage.setItem(TARGET_USERS_KEY, JSON.stringify(usersArray));
    
    // 캐시 업데이트 (Set으로 저장)
    cachedTargetUsers = new Set(usersArray);
  } catch (error) {
    console.error("Failed to save targetUsers to localStorage:", error);
  }
}

/**
 * targetUsers에 사용자를 추가합니다 (백엔드와 동기화)
 */
export async function addTargetUser(userId: string): Promise<void> {
  try {
    // 백엔드에 추가 요청
    await ipcService.targetUsers.addTargetUser(userId);
    
    // 로컬 캐시 업데이트
    const current = getTargetUsers();
    if (!current.has(userId)) {
      current.add(userId);
      setTargetUsers(current);
    }
  } catch (error) {
    console.error("Failed to add target user:", error);
    throw error;
  }
}

/**
 * targetUsers에서 사용자를 제거합니다 (백엔드와 동기화)
 */
export async function removeTargetUser(userId: string): Promise<void> {
  try {
    // 백엔드에 제거 요청
    await ipcService.targetUsers.removeTargetUser(userId);
    
    // 로컬 캐시 업데이트
    const current = getTargetUsers();
    if (current.has(userId)) {
      current.delete(userId);
      setTargetUsers(current);
    }
  } catch (error) {
    console.error("Failed to remove target user:", error);
    throw error;
  }
}

/**
 * 캐시를 강제로 무효화합니다 (테스트나 디버깅용)
 */
export function clearCache(): void {
  cachedTargetUsers = null;
}

/**
 * 특정 사용자가 targetUsers에 포함되어 있는지 확인합니다
 */
export function isTargetUser(userId: string): boolean {
  const targetUsers = getTargetUsers();
  return targetUsers.has(userId);
}