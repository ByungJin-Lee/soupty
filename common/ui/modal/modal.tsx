"use client";

import { createPortal } from "react-dom";
import { useModal } from "../../hooks/modal";
import { mounted } from "../mounted";
import { ModalHeader } from "./modal-header";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  ignoreBackdropClick?: boolean;
}

const ModalComponent: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  ignoreBackdropClick = false,
}) => {
  const { handleBackdropClick } = useModal({
    isOpen,
    onClose,
    ignoreBackdropClick,
  });

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10"
      onClick={handleBackdropClick}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-white p-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title={title}
          showCloseButton={showCloseButton}
          onClose={onClose}
        />
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export const Modal = mounted(ModalComponent);
