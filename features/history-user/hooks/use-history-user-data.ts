import { useCallback, useEffect, useRef, useState } from "react";

import ipcService from "~/services/ipc";
import { LogBlock } from "../types/log";
import { searchUserLogs } from "../utils/search";

export const useHistoryUserData = (userId: string, channelId: string) => {
  const [blocks, setBlocks] = useState<LogBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadedDateIndex, setLoadedDateIndex] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  const isLoadingRef = useRef(false);

  // 사용 가능한 날짜 목록 조회
  const loadAvailableDates = useCallback(async () => {
    if (isLoadingRef.current) return;

    setIsLoading(true);
    isLoadingRef.current = true;

    try {
      const dates = await ipcService.chatHistory.getUserLogDates(
        userId,
        channelId
      );
      // 오늘 날짜는 live block에서 관리됩니다.
      setAvailableDates(dates.filter((v) => v !== today));
      setHasMore(dates.length > 0);
      setLoadedDateIndex(0);
    } catch (error) {
      console.error("날짜 목록 조회 실패:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [userId, channelId, today]);

  // 특정 날짜 인덱스의 데이터 로드
  const loadDateData = useCallback(
    async (dateIndex: number): Promise<LogBlock> => {
      if (dateIndex >= availableDates.length) {
        throw new Error(`Invalid date index: ${dateIndex}`);
      }

      const date = availableDates[dateIndex];

      return searchUserLogs(userId, channelId, date);
    },
    [userId, channelId, availableDates]
  );

  // 초기 데이터 로드 (첫 번째 날짜)
  const loadInitialData = useCallback(async () => {
    if (isLoadingRef.current || availableDates.length === 0) return;

    setIsLoading(true);
    isLoadingRef.current = true;

    try {
      const block = await loadDateData(0); // 첫 번째 날짜 (인덱스 0)
      // 첫 로드시에는 그대로 설정 (최신 날짜가 이미 올바른 위치)
      setBlocks([block]);
      setLoadedDateIndex(1);
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [availableDates, loadDateData]);

  // 더 많은 날짜의 데이터 로드
  const loadMoreData = useCallback(async () => {
    if (
      isLoadingRef.current ||
      !hasMore ||
      loadedDateIndex >= availableDates.length
    ) {
      return;
    }

    setIsLoading(true);
    isLoadingRef.current = true;

    try {
      const newBlock = await loadDateData(loadedDateIndex);

      // 새로운 과거 데이터를 맨 위에 추가 (역방향 스크롤)
      setBlocks((prev) => [newBlock, ...prev]);
      setLoadedDateIndex((prev) => prev + 1);
      if (loadedDateIndex + 1 >= availableDates.length) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("과거 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [availableDates, loadedDateIndex, hasMore, loadDateData]);

  // 초기 로드
  useEffect(() => {
    loadAvailableDates();
  }, [loadAvailableDates]);

  useEffect(() => {
    if (availableDates.length > 0) {
      loadInitialData();
    }
  }, [availableDates, loadInitialData]);

  return {
    today,
    blocks,
    isLoading,
    hasMore,
    loadMoreData,
    isLoadingRef,
    availableDates, // 스크롤 위치 조정을 위해 노출
  };
};
