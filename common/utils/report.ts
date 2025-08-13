import { ReportChunk } from "~/services/ipc/types";
import { parseHHMMSSToSecondOffset } from "./date";

export interface FilteredLOLChunkItem {
  score: number;
  timestamp: string;
  chunkIndex: number;
  seconds: number;
}

export const filterChunksByLolScore = (
  chunks: ReportChunk[],
  threshold: number
): FilteredLOLChunkItem[] => {
  const filtered: FilteredLOLChunkItem[] = [];

  chunks.forEach((chunk, index) => {
    if (chunk.chat.lolScore >= threshold) {
      const timestamp = chunk.relativeTimestamp;

      filtered.push({
        score: chunk.chat.lolScore,
        chunkIndex: index,
        seconds: parseHHMMSSToSecondOffset(timestamp),
        timestamp,
      });
    }
  });

  return filtered.toSorted((lhs, rhs) => rhs.score - lhs.score);
};
