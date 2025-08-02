import { ReportChunk, ReportMetadata } from "~/services/ipc/types";
import { formatTimeHHMMSS } from "./date";

export interface FilteredLOLChunkItem {
  score: number;
  chunkIndex: number;
  start: {
    timestamp: string;
    seconds: number;
  };
  end: {
    timestamp: string;
    seconds: number;
  };
}

export const filterChunksByLolScore = (
  chunks: ReportChunk[],
  metadata: ReportMetadata,
  threshold: number
): FilteredLOLChunkItem[] => {
  const filtered: FilteredLOLChunkItem[] = [];

  chunks.forEach((chunk, index) => {
    if (chunk.chat.lolScore >= threshold) {
      const startOffsetSeconds = index * metadata.chunkSize;
      const endOffsetSeconds = startOffsetSeconds + metadata.chunkSize;

      const startTime = formatTimeHHMMSS(startOffsetSeconds);
      const endTime = formatTimeHHMMSS(endOffsetSeconds);

      filtered.push({
        score: chunk.chat.lolScore,
        chunkIndex: index,
        start: {
          timestamp: startTime,
          seconds: startOffsetSeconds,
        },
        end: {
          timestamp: endTime,
          seconds: endOffsetSeconds,
        },
      });
    }
  });

  return filtered.toSorted((lhs, rhs) => rhs.score - lhs.score);
};
