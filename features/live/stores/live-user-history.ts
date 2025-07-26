import { create } from "zustand";

interface LiveUserHistoryState {
  userId?: string;
}

interface LiveUserHistoryAction {
  open(userId: string): void;
  close(): void;
}

export const useLiveUserHistoryStore = create<
  LiveUserHistoryAction & LiveUserHistoryState
>((set) => ({
  user: undefined,
  open(userId) {
    set({ userId });
  },
  close() {
    set({ userId: undefined });
  },
}));
