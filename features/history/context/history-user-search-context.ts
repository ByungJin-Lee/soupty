import { createContext, useContext } from "react";
import {
  PaginationParams,
  UserSearchFilters,
  UserSearchResult,
} from "~/services/ipc/types";

interface HistoryUserSearchContext {
  result: UserSearchResult | null;
  search(
    filter: UserSearchFilters,
    pagination: PaginationParams
  ): Promise<void>;
}

const ctx = createContext<HistoryUserSearchContext | null>(null);

export const HistoryUserSearchContextProvider = ctx.Provider;

export const useHistoryUserSearchContext = () => {
  const s = useContext(ctx);
  if (!s) {
    throw Error(
      "useHistoryUserSearchContext must be used within HistoryUserSearchContextProvider"
    );
  }
  return s;
};
