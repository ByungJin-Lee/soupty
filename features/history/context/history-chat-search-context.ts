import { createContext, useContext } from "react";
import {
  ChatSearchFilters,
  ChatSearchResult,
  PaginationParams,
} from "~/services/ipc/types";

interface HistoryChatSearchContext {
  result: ChatSearchResult | null;
  search(
    filter: ChatSearchFilters,
    pagination: PaginationParams
  ): Promise<void>;
}

const ctx = createContext<HistoryChatSearchContext | null>(null);

export const HistoryChatSearchContextProvider = ctx.Provider;

export const useHistoryChatSearchContext = () => {
  const s = useContext(ctx);
  if (!s) {
    throw Error("");
  }
  return s;
};
