import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoScrollOptions {
  /** 스크롤 감지 임계값 (px) */
  threshold?: number;
  /** 스크롤 애니메이션 동작 */
  behavior?: ScrollBehavior;
}

interface UseAutoScrollReturn {
  /** 스크롤 컨테이너 ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 스크롤 앵커 ref (스크롤 대상) */
  scrollAnchorRef: React.RefObject<HTMLDivElement | null>;
  /** 현재 최하단에 있는지 여부 */
  isAtBottom: boolean;
  /** 스크롤 체크 함수 */
  checkIfAtBottom: () => void;
  /** 수동으로 최하단으로 스크롤 */
  scrollToBottom: () => void;
}

/**
 * 조건부 자동 스크롤을 제공하는 커스텀 hook
 * 사용자가 최하단에 있을 때만 새 콘텐츠 추가 시 자동 스크롤됩니다
 */
export function useAutoScroll(
  trigger: number | string, // 스크롤 트리거 (예: lastChatUpdate)
  options: UseAutoScrollOptions = {}
): UseAutoScrollReturn {
  const { threshold = 50, behavior = "smooth" } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 스크롤 위치 감지
  const checkIfAtBottom = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight <= threshold;
    setIsAtBottom(atBottom);
  }, [threshold]);

  // 최하단으로 스크롤
  const scrollToBottom = useCallback(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({
        behavior,
        block: "end",
      });
    }
  }, [behavior]);

  // 트리거 변경 시 조건부 자동 스크롤
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [trigger, isAtBottom, scrollToBottom]);

  return {
    containerRef,
    scrollAnchorRef,
    isAtBottom,
    checkIfAtBottom,
    scrollToBottom,
  };
}
