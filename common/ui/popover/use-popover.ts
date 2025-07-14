import { useCallback, useEffect, useMemo, useState } from "react";
import { usePopoverStore } from "~/common/stores/popover-store";

export const usePopover = () => {
  const { isVisible, rect, hidePopover } = usePopoverStore();
  const [popoverElement, setPopoverElement] = useState<HTMLDivElement | null>(
    null
  );

  // callback ref로 popover element 설정
  const popoverRef = useCallback((node: HTMLDivElement | null) => {
    setPopoverElement(node);
  }, []);

  // 이벤트 핸들러를 useCallback으로 메모화
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (popoverElement && !popoverElement.contains(event.target as Node)) {
        hidePopover();
      }
    },
    [hidePopover, popoverElement]
  );

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hidePopover();
      }
    },
    [hidePopover]
  );

  // 클릭 외부 감지하여 popover 닫기
  useEffect(() => {
    if (isVisible) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible, handleClickOutside, handleEscape]);

  // 화면 경계 조정 - useMemo로 최적화
  const adjustedPosition = useMemo(() => {
    if (!rect || !popoverElement) return { x: 0, y: 0 };

    const popoverRect = popoverElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // 기본적으로 요소 아래쪽에 표시
    let x = rect.left;
    let y = rect.bottom + 4; // 4px 간격

    // 오른쪽 경계 체크
    if (x + popoverRect.width > viewport.width) {
      x = viewport.width - popoverRect.width - 16; // 16px 여백
    }

    // 아래쪽 경계 체크 - 팝오버가 화면을 벗어나면 위로 표시
    if (y + popoverRect.height > viewport.height) {
      y = rect.top - popoverRect.height - 4; // 요소 위쪽에 표시
    }

    // 최소 여백 보장
    x = Math.max(8, x);
    y = Math.max(8, y);

    return { x, y };
  }, [rect, popoverElement]);

  return {
    isVisible,
    adjustedPosition,
    popoverRef,
  };
};
