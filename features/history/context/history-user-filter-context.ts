import { createContext, useContext } from "react";
import { UserSearchFilters } from "~/services/ipc/types";

const ctx = createContext<UserSearchFilters | null>(null);

export const HistoryUserFilterProvider = ctx.Provider;

export const useHistoryUserFilterCtx = () => {
  const state = useContext(ctx);
  if (!state) {
    throw Error("useHistoryUserFilterCtx must be used within HistoryUserFilterProvider");
  }
  return state;
};