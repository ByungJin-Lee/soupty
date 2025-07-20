import { createContext, useContext } from "react";
import {
  BroadcastSessionSearchFilters,
  BroadcastSessionSearchResult,
  PaginationParams,
} from "~/services/ipc/types";

interface BroadcastSessionContext {
  result: BroadcastSessionSearchResult | null;
  loading: boolean;
  search(
    filters: BroadcastSessionSearchFilters,
    pagination: PaginationParams
  ): Promise<void>;
}

const ctx = createContext<BroadcastSessionContext | null>(null);

export const BroadcastSessionContextProvider = ctx.Provider;

export const useBroadcastSessionContext = () => {
  const context = useContext(ctx);
  if (!context) {
    throw new Error("useBroadcastSessionContext must be used within BroadcastSessionContextProvider");
  }
  return context;
};