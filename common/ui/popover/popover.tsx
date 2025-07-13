"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePopoverStore } from "~/common/stores/popover-store";

interface PopoverProps {
  children: React.ReactNode;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({ children, className = "" }) => {
  const { isVisible, position, hidePopover } = usePopoverStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  // 이벤트 핸들러를 useCallback으로 메모화
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      hidePopover();
    }
  }, [hidePopover]);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      hidePopover();
    }
  }, [hidePopover]);

  // 클릭 외부 감지하여 popover 닫기
  useEffect(() => {
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible, handleClickOutside, handleEscape]);

  // 화면 경계 조정 - useMemo로 최적화
  const adjustedPosition = useMemo(() => {
    if (!position || !popoverRef.current) return position;

    const rect = popoverRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let { x, y } = position;

    // 오른쪽 경계 체크
    if (x + rect.width > viewport.width) {
      x = viewport.width - rect.width - 16; // 16px 여백
    }

    // 아래쪽 경계 체크
    if (y + rect.height > viewport.height) {
      y = y - rect.height - 8; // popover를 위로 표시
    }

    // 최소 여백 보장
    x = Math.max(8, x);
    y = Math.max(8, y);

    return { x, y };
  }, [position]);

  if (!isVisible || !position) {
    return null;
  }

  return createPortal(
    <div
      ref={popoverRef}
      className={`fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}
      style={{
        left: adjustedPosition?.x ?? position.x,
        top: adjustedPosition?.y ?? position.y,
      }}
    >
      {children}
    </div>,
    document.body
  );
};