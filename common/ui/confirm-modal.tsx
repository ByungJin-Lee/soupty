"use client";
import { useConfirmStore } from "../stores/confirm-modal-store";
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
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </Modal>
  );
};
