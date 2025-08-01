import { createContext, useContext } from "react";
import {
  BroadcastSessionSearchFilters,
  BroadcastSessionSearchResult,
  PaginationParams,
} from "~/services/ipc/types";

interface BroadcastSessionSearchContext {
  result: BroadcastSessionSearchResult | null;
  loading: boolean;
  search(
    filters: BroadcastSessionSearchFilters,
    pagination: PaginationParams
  ): Promise<void>;
}

const ctx = createContext<BroadcastSessionSearchContext | null>(null);

export const BroadcastSessionSearchContextProvider = ctx.Provider;

export const useBroadcastSessionSearchContext = () => {
  const context = useContext(ctx);
  if (!context) {
    throw new Error(
      "useBroadcastSessionSearchContext must be used within BroadcastSessionContextProvider"
    );
  }
  return context;
};
