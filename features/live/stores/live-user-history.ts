import { create } from "zustand";

interface LiveUserHistoryState {
  userId?: string;
  username?: string;
}

interface LiveUserHistoryAction {
  open(userId: string, username?: string): void;
  close(): void;
}

export const useLiveUserHistoryStore = create<
  LiveUserHistoryAction & LiveUserHistoryState
>((set) => ({
  user: undefined,
  open(userId, username) {
    set({ userId, username });
  },
  close() {
    set({ userId: undefined, username: undefined });
  },
}));
