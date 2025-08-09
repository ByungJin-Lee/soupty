import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatFontSizeState {
  fontSize: number;
}

interface ChatFontSizeActions {
  setFontSize: (size: number) => void;
  resetFontSize: () => void;
}

const STORAGE_KEY = "soupty-chat-font-size";
const DEFAULT_FONT_SIZE = 16;

export const useChatFontSizeStore = create<
  ChatFontSizeState & ChatFontSizeActions
>()(
  persist(
    (set) => ({
      fontSize: DEFAULT_FONT_SIZE,
      setFontSize: (size) => {
        set({ fontSize: size });
      },
      resetFontSize: () => {
        set({ fontSize: DEFAULT_FONT_SIZE });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ fontSize: state.fontSize }),
    }
  )
);
