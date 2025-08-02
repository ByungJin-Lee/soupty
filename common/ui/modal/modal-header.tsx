import { CloseButton } from "./close-button";

interface ModalHeaderProps {
  title?: string;
  showCloseButton?: boolean;
  onClose: () => void;
}

export function ModalHeader({
  title,
  showCloseButton = true,
  onClose,
}: ModalHeaderProps) {
  if (!title && !showCloseButton) return null;

  return (
    <div className="mb-2 flex items-center justify-end">
      {title && <h2 className="text-md font-semibold mr-2 flex-1">{title}</h2>}
      {showCloseButton && <CloseButton onClick={onClose} />}
    </div>
  );
}
