import { useEffect } from "react";

interface UseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ignoreBackdropClick?: boolean;
}

export function useModal({
  isOpen,
  onClose,
  ignoreBackdropClick = false,
}: UseModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!ignoreBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return {
    handleBackdropClick,
  };
}
