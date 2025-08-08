"use client";

import { memo } from "react";
import { ChatEvent } from "~/types/event/chat";
import { useChatFontSizeStore } from "../stores/font-size";
import { ChatRow } from "./chat-row";

type Props = {
  messages: ChatEvent[];
  className?: string;
  onItemMeasure?: (element: HTMLElement, itemId: string) => void;
};

export const ChatView: React.FC<Props> = memo(
  ({ messages, className = "", onItemMeasure }) => {
    const { fontSize, setFontSize } = useChatFontSizeStore();

    const handleFontSizeChange = (delta: number) => {
      const newSize = Math.max(10, fontSize + delta);
      setFontSize(newSize);
    };

    return (
      <div
        className={`${className} relative`}
        style={
          { "--chat-row-font-size": `${fontSize}px` } as React.CSSProperties
        }
      >
        {/* Font size controls */}
        <div className="sticky -mt-6 top-1 mr-2 z-10 flex justify-end opacity-50 hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              onClick={() => handleFontSizeChange(-1)}
              className="w-6 h-6 bg-black/20 hover:bg-black/30 text-white rounded text-xs flex items-center justify-center"
              title="폰트 크기 줄이기"
            >
              -
            </button>
            <button
              onClick={() => handleFontSizeChange(1)}
              className="w-6 h-6 bg-black/20 hover:bg-black/30 text-white rounded text-xs flex items-center justify-center"
              title="폰트 크기 늘리기"
            >
              +
            </button>
          </div>
        </div>
        {messages.map((v) => (
          <ChatRow key={v.id} data={v} onMeasure={onItemMeasure} />
        ))}
      </div>
    );
  }
);

ChatView.displayName = "ChatView";
