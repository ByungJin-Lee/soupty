import { createContext, useContext } from "react";
import { ChatSearchFilters } from "~/services/ipc/types";

const ctx = createContext<ChatSearchFilters | null>(null);

export const HistoryChatFilterProvider = ctx.Provider;

export const useHistoryChatFilterCtx = () => {
  const state = useContext(ctx);
  if (!state) {
    throw Error("");
  }
  return state;
};
