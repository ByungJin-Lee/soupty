"use client";
import { useEffect, useState } from "react";
import { usePromptStore } from "../stores/prompt-modal-store";
import { Modal } from "./modal";

export const PromptModal: React.FC = () => {
  const { status, question, answer } = usePromptStore();
  const [text, setText] = useState("");

  const handleClose = () => answer(null);
  const handleConfirm = () => answer(text);

  useEffect(() => {
    setText("");
  }, [setText, status]);

  return (
    <Modal isOpen={status === "waiting"} onClose={handleClose}>
      <p>{question}</p>
      <input
        type="text"
        value={text}
        className=" bg-gray-100 rounded-md py-1 px-2 outline-none text-gray-800"
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={handleClose}
          className="px-2 py-1 text-gray-600 hover:text-gray-800"
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          확인
        </button>
      </div>
    </Modal>
  );
};
