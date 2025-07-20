import { createContext, useContext } from "react";
import {
  EventSearchFilters,
  EventSearchResult,
  PaginationParams,
} from "~/services/ipc/types";

interface HistoryEventSearchContext {
  result: EventSearchResult | null;
  search(
    filter: EventSearchFilters,
    pagination: PaginationParams
  ): Promise<void>;
}

const ctx = createContext<HistoryEventSearchContext | null>(null);

export const HistoryEventSearchContextProvider = ctx.Provider;

export const useHistoryEventSearchContext = () => {
  const s = useContext(ctx);
  if (!s) {
    throw Error("");
  }
  return s;
};