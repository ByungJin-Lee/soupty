"use client";
import { useConfirmStore } from "../stores/confirm-modal-store";
import { Button } from "./button";
import { Modal } from "./modal";

export const ConfirmModal: React.FC = () => {
  const { status, title, message } = useConfirmStore();

  const handleCancel = () => useConfirmStore.getState().answer(false);
  const handleConfirm = () => useConfirmStore.getState().answer(true);

  return (
    <Modal isOpen={status === "waiting"} onClose={handleCancel} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            삭제
          </Button>
        </div>
      </div>
    </Modal>
  );
};
