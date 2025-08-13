import { useState } from "react";
import { ReportChunk } from "~/services/ipc/types";
import { LabelVariant } from "../context/report-label-context";

const getRealtimeLabel = (chunk: ReportChunk) => {
  if (!chunk.realtimeTimestamp) {
    chunk.realtimeTimestamp = new Date(chunk.timestamp).toLocaleTimeString();
  }
  return chunk.realtimeTimestamp;
};

const getVodOffsetLabel = (chunk: ReportChunk) => chunk.relativeTimestamp;

export const useReportLabel = () => {
  const [labelType, setLabelType] = useState<LabelVariant>("realtime");

  const getCurrentLabel =
    labelType === "realtime" ? getRealtimeLabel : getVodOffsetLabel;

  const toggleLabelType = () => {
    setLabelType((prev) => (prev === "realtime" ? "vod-offset" : "realtime"));
  };

  return {
    labelType,
    setLabelType,
    getCurrentLabel,
    toggleLabelType,
  };
};
