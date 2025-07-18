import { create } from "zustand";

type PromptStatus = "idle" | "waiting";

interface PromptStoreState {
  status: PromptStatus;
  question: string;
  /**
   * @description "waiting" 상태일때, resolver가 동작합니다.
   */
  resolve?: (value?: string | null) => void;
}

interface PromptStoreAction {
  prompt(question: string): Promise<string | null | undefined>;
  answer(answer?: string | null): void;
}

export const usePromptStore = create<PromptStoreState & PromptStoreAction>(
  (set) => ({
    status: "idle",
    question: "",
    resolve: undefined,
    prompt(question) {
      return new Promise<string | undefined | null>((resolve) => {
        // 초기화
        set({
          question,
          status: "waiting",
          resolve,
        });
      });
    },
    answer(answer) {
      set((s) => {
        s.resolve?.(answer);
        return {
          status: "idle",
          resolve: undefined,
          question: "",
        };
      });
    },
  })
);

export const prompt = async (question: string) => {
  return usePromptStore.getState().prompt(question);
};
