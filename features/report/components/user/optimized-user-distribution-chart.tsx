import { memo, useMemo } from "react";
import { Line } from "~/common/ui/chart";
import { ReportChunk } from "~/services/ipc/types";
import { userDistributionChartOptions } from "./fixtures";
import { useChartDimensions } from "../hooks/use-chart-data";
import { ChartContainer } from "./chart-container";

interface OptimizedUserDistributionChartProps {
  chunks: ReportChunk[];
  startAt: string;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

interface UserDataSeries {
  unique: { x: number; y: number }[];
  subscriber: { x: number; y: number }[];
  fan: { x: number; y: number }[];
  normal: { x: number; y: number }[];
}

interface UserStats {
  unique: { min: number; max: number; avg: number };
  subscriber: { min: number; max: number; avg: number };
  fan: { min: number; max: number; avg: number };
  normal: { min: number; max: number; avg: number };
}

const SERIES_CONFIG = [
  {
    key: "unique" as const,
    label: "전체 유니크",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.1)",
    statsColor: "text-indigo-600",
    statsBg: "bg-indigo-50",
  },
  {
    key: "subscriber" as const,
    label: "구독자",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    statsColor: "text-emerald-600",
    statsBg: "bg-emerald-50",
  },
  {
    key: "fan" as const,
    label: "팬",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    statsColor: "text-amber-600",
    statsBg: "bg-amber-50",
  },
  {
    key: "normal" as const,
    label: "일반",
    color: "#6b7280",
    bgColor: "rgba(107, 114, 128, 0.1)",
    statsColor: "text-gray-600",
    statsBg: "bg-gray-50",
  },
] as const;

const calculateStats = (data: { x: number; y: number }[]) => {
  const nonZeroValues = data.filter(d => d.y > 0).map(d => d.y);
  
  if (nonZeroValues.length === 0) {
    return { min: 0, max: 0, avg: 0 };
  }
  
  const min = Math.min(...nonZeroValues);
  const max = Math.max(...nonZeroValues);
  const avg = Math.round(nonZeroValues.reduce((sum, val) => sum + val, 0) / nonZeroValues.length);
  
  return { min, max, avg };
};

const StatsGrid = memo<{ stats: UserStats; hasData: boolean }>(({ stats, hasData }) => {
  if (!hasData) {
    return (
      <div className="text-center text-gray-500 py-4 mb-4">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 text-sm mb-4">
      {SERIES_CONFIG.map((config) => {
        const seriesStats = stats[config.key];
        return (
          <div key={config.key} className={`text-center ${config.statsBg} rounded-lg p-3`}>
            <div className={`font-semibold ${config.statsColor} text-lg`}>
              {seriesStats.avg.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 mt-1">{config.label} 평균</div>
            <div className="text-xs text-gray-500 mt-1">
              {seriesStats.min.toLocaleString()} ~ {seriesStats.max.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
});

StatsGrid.displayName = "StatsGrid";

const Legend = memo(() => (
  <div className="flex justify-center space-x-6 text-sm mb-4">
    {SERIES_CONFIG.map((config) => (
      <div key={config.key} className="flex items-center space-x-2">
        <div className="w-4 h-0.5" style={{ backgroundColor: config.color }}></div>
        <span>{config.label}</span>
      </div>
    ))}
  </div>
));

Legend.displayName = "Legend";

export const OptimizedUserDistributionChart = memo<OptimizedUserDistributionChartProps>(({
  chunks,
  startAt,
  title = "사용자 분포 차트",
  subtitle = "시간대별 채팅 참여자 유형 분포",
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const chartData = useMemo<UserDataSeries>(() => {
    return {
      unique: chunks.map((chunk, i) => ({ x: i, y: chunk.user.uniqueCount })),
      subscriber: chunks.map((chunk, i) => ({ x: i, y: chunk.user.subscriberCount })),
      fan: chunks.map((chunk, i) => ({ x: i, y: chunk.user.fanCount })),
      normal: chunks.map((chunk, i) => ({ x: i, y: chunk.user.normalCount })),
    };
  }, [chunks]);

  const { width, height } = useChartDimensions(chunks.length);

  const stats = useMemo<UserStats>(() => ({
    unique: calculateStats(chartData.unique),
    subscriber: calculateStats(chartData.subscriber),
    fan: calculateStats(chartData.fan),
    normal: calculateStats(chartData.normal),
  }), [chartData]);

  const datasets = useMemo(() => 
    SERIES_CONFIG.map(config => ({
      label: config.label,
      data: chartData[config.key],
      borderColor: config.color,
      backgroundColor: config.bgColor,
      pointBackgroundColor: "#ffffff",
      pointBorderColor: config.color,
      pointHoverBackgroundColor: config.color,
      pointHoverBorderColor: "#ffffff",
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: false,
    })), [chartData]
  );

  const chartOptions = useMemo(() => 
    userDistributionChartOptions(chunks.length, new Date(startAt)),
    [chunks.length, startAt]
  );

  const hasData = useMemo(() => 
    Object.values(chartData).some(series => series.some(point => point.y > 0)),
    [chartData]
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
    >
      <StatsGrid stats={stats} hasData={hasData} />
      <Legend />
      
      {hasData ? (
        <div className="overflow-x-auto w-full">
          <div className="min-w-full" style={{ width }}>
            <Line
              data={{ datasets }}
              width={width}
              height={height}
              options={chartOptions}
            />
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          표시할 데이터가 없습니다
        </div>
      )}
    </ChartContainer>
  );
});

OptimizedUserDistributionChart.displayName = "OptimizedUserDistributionChart";