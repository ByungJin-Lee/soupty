import { createContext, useContext } from "react";
import { EventSearchFilters } from "~/services/ipc/types";

const ctx = createContext<EventSearchFilters | null>(null);

export const HistoryEventFilterProvider = ctx.Provider;

export const useHistoryEventFilterCtx = () => {
  const state = useContext(ctx);
  if (!state) {
    throw Error("");
  }
  return state;
};