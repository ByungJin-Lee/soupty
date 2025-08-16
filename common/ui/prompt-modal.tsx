"use client";
import { useEffect, useState } from "react";
import { usePromptStore } from "../stores/prompt-modal-store";
import { Button } from "./button";
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
        className="bg-gray-100 rounded-md py-1 px-2 outline-none text-gray-800"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
      />
      <div className="flex justify-end gap-2 mt-2">
        <Button variant="secondary" size="sm" onClick={handleClose}>
          취소
        </Button>
        <Button variant="primary" size="sm" onClick={handleConfirm}>
          확인
        </Button>
      </div>
    </Modal>
  );
};
