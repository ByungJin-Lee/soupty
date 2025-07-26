import { create } from "zustand";

type ConfirmStatus = "idle" | "waiting";

interface ConfirmStoreState {
  status: ConfirmStatus;
  title: string;
  message: string;
  resolve?: (value: boolean) => void;
}

interface ConfirmStoreAction {
  confirm(title: string, message: string): Promise<boolean>;
  answer(confirmed: boolean): void;
}

export const useConfirmStore = create<ConfirmStoreState & ConfirmStoreAction>(
  (set) => ({
    status: "idle",
    title: "",
    message: "",
    resolve: undefined,
    confirm(title, message) {
      return new Promise<boolean>((resolve) => {
        set({
          title,
          message,
          status: "waiting",
          resolve,
        });
      });
    },
    answer(confirmed) {
      set((s) => {
        s.resolve?.(confirmed);
        return {
          status: "idle",
          resolve: undefined,
          title: "",
          message: "",
        };
      });
    },
  })
);

export const confirm = async (title: string, message: string) => {
  return useConfirmStore.getState().confirm(title, message);
};