import { useCallback, useEffect, useRef, useState } from "react";

// 가장 가까운 스크롤 가능한 조상 요소를 찾는 함수
function getScrollParent(element: Element): Element | Window {
  const style = getComputedStyle(element);
  const excludeStaticParent = style.position === "absolute";
  const overflowRegex = /(auto|scroll)/;

  if (style.position === "fixed") return document.body;

  for (
    let parent = element;
    parent && (parent = parent.parentElement as HTMLElement);

  ) {
    const style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === "static") {
      continue;
    }
    if (
      overflowRegex.test(style.overflow + style.overflowY + style.overflowX)
    ) {
      return parent;
    }
  }

  return window;
}

interface UseAutoScrollOptions {
  /** 스크롤 감지 임계값 (px) */
  threshold?: number;
  /** 스크롤 애니메이션 동작 */
  behavior?: ScrollBehavior;
}

interface UseAutoScrollReturn {
  /** 스크롤 앵커 ref (스크롤 대상) */
  scrollAnchorRef: React.RefObject<HTMLDivElement | null>;
  /** 현재 최하단에 있는지 여부 */
  isAtBottom: boolean;
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

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 스크롤 위치 감지
  const checkIfAtBottom = useCallback(() => {
    if (!scrollAnchorRef.current) return;

    const scrollParent = getScrollParent(scrollAnchorRef.current);

    if (scrollParent === window) {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - threshold;
      setIsAtBottom(atBottom);
    } else {
      const element = scrollParent as Element;
      const { scrollTop, scrollHeight, clientHeight } = element;
      const atBottom = scrollHeight - scrollTop - clientHeight <= threshold;
      setIsAtBottom(atBottom);
    }
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

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    if (!scrollAnchorRef.current) return;

    const scrollParent = getScrollParent(scrollAnchorRef.current);

    scrollParent.addEventListener("scroll", checkIfAtBottom, { passive: true });

    return () => {
      scrollParent.removeEventListener("scroll", checkIfAtBottom);
    };
  }, [checkIfAtBottom]);

  return {
    scrollAnchorRef,
    isAtBottom,
    scrollToBottom,
  };
}
