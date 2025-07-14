"use client";

import { createPortal } from "react-dom";
import { usePopover } from "./use-popover";

interface PopoverProps {
  children: React.ReactNode;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  className = "",
}) => {
  const { isVisible, adjustedPosition, popoverRef } = usePopover();

  if (!isVisible) {
    return null;
  }

  return createPortal(
    <div
      ref={popoverRef}
      className={`fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {children}
    </div>,
    document.body
  );
};
