"use client";

import { createContext, useContext } from "react";
import { ReportChunk } from "~/services/ipc/types";

export type LabelVariant = "realtime" | "vod-offset";

export interface ReportLabelContext {
  labelType: LabelVariant;
  setLabelType(value: LabelVariant): void;
  getCurrentLabel(chunk: ReportChunk): string;
}

const ctx = createContext<ReportLabelContext | null>(null);

export const ReportLabelContextProvider = ctx.Provider;

export const useReportLabelContext = () => {
  const context = useContext(ctx);
  if (!context) {
    throw new Error(
      "useReportLabelContext must be used within ReportLabelContextProvider"
    );
  }
  return context;
};
