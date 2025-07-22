import { useMemo } from "react";
import { ReportChunk } from "~/services/ipc/types";

interface ChartDataPoint {
  x: number;
  y: number;
}

interface ChartStats {
  min: number;
  max: number;
  avg: number;
  total: number;
  count: number;
}

export interface ProcessedChartData {
  data: ChartDataPoint[];
  stats: ChartStats;
  hasData: boolean;
}

export const useChartData = (
  chunks: ReportChunk[],
  getter: (chunk: ReportChunk) => number,
  filterZeros: boolean = true
): ProcessedChartData => {
  return useMemo(() => {
    const data = chunks.map((chunk, i) => ({ x: i, y: getter(chunk) }));
    
    // 0값 필터링 옵션
    const validValues = filterZeros 
      ? data.filter(d => d.y > 0).map(d => d.y)
      : data.map(d => d.y);
    
    if (validValues.length === 0) {
      return {
        data,
        stats: { min: 0, max: 0, avg: 0, total: 0, count: 0 },
        hasData: false,
      };
    }
    
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    const total = validValues.reduce((sum, val) => sum + val, 0);
    const avg = Math.round(total / validValues.length);
    
    return {
      data,
      stats: { min, max, avg, total, count: validValues.length },
      hasData: true,
    };
  }, [chunks, getter, filterZeros]);
};

export const useMultiSeriesChartData = (
  chunks: ReportChunk[],
  getters: Record<string, (chunk: ReportChunk) => number>,
  filterZeros: boolean = true
) => {
  return useMemo(() => {
    const series: Record<string, ProcessedChartData> = {};
    
    Object.entries(getters).forEach(([key, getter]) => {
      series[key] = {
        ...useChartData(chunks, getter, filterZeros),
      };
    });
    
    return series;
  }, [chunks, getters, filterZeros]);
};

export const useChartDimensions = (dataLength: number) => {
  return useMemo(() => {
    const baseWidth = Math.max(1600, dataLength * 9);
    const maxWidth = Math.min(baseWidth, dataLength * 45);
    
    return {
      width: maxWidth,
      height: 300,
      isLargeDataset: dataLength > 1000,
    };
  }, [dataLength]);
};