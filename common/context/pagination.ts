"use client";

import { createContext, useContext } from "react";

interface PaginationContext {
  page: number;
  pageSize: number;
  setPage(value: number): void;
  setPageSize(value: number): void;
}

const ctx = createContext<PaginationContext | null>(null);

export const PaginationContextProvider = ctx.Provider;

export const usePaginationContext = () => {
  const s = useContext(ctx);
  if (!s) {
    throw Error("");
  }
  return s;
};
