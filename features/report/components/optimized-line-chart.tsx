import { memo, useMemo, useCallback } from "react";
import { Line } from "~/common/ui/chart";
import { ReportChunk } from "~/services/ipc/types";
import { reportLineChartOptions } from "./fixtures";
import { useChartData, useChartDimensions } from "../hooks/use-chart-data";
import { ChartContainer } from "./chart-container";

interface OptimizedLineChartProps {
  chunks: ReportChunk[];
  getter: (chunk: ReportChunk) => number;
  startAt: string;
  color?: "red" | "green" | "blue" | "yellow";
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  showStats?: boolean;
  filterZeros?: boolean;
}

const COLOR_MAP = {
  red: { border: "#ef4444", background: "rgba(239, 68, 68, 0.1)" },
  green: { border: "#10b981", background: "rgba(16, 185, 129, 0.1)" },
  blue: { border: "#3b82f6", background: "rgba(59, 130, 246, 0.1)" },
  yellow: { border: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" },
} as const;

const StatsSummary = memo<{ 
  stats: ReturnType<typeof useChartData>['stats']; 
  color: string;
  hasData: boolean;
}>(({ stats, color, hasData }) => {
  if (!hasData) {
    return (
      <div className="text-center text-gray-500 py-4">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="flex justify-center space-x-8 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
      <div className="text-center">
        <div className="font-semibold" style={{ color }}>
          {stats.min.toLocaleString()}
        </div>
        <div className="text-xs">최솟값</div>
      </div>
      <div className="text-center">
        <div className="font-semibold" style={{ color }}>
          {stats.avg.toLocaleString()}
        </div>
        <div className="text-xs">평균</div>
      </div>
      <div className="text-center">
        <div className="font-semibold" style={{ color }}>
          {stats.max.toLocaleString()}
        </div>
        <div className="text-xs">최댓값</div>
      </div>
      <div className="text-center">
        <div className="font-semibold" style={{ color }}>
          {stats.total.toLocaleString()}
        </div>
        <div className="text-xs">총합</div>
      </div>
    </div>
  );
});

StatsSummary.displayName = "StatsSummary";

export const OptimizedLineChart = memo<OptimizedLineChartProps>(({
  chunks,
  getter,
  startAt,
  color = "green",
  title,
  subtitle,
  isLoading = false,
  error = null,
  onRetry,
  showStats = true,
  filterZeros = true,
}) => {
  const { data, stats, hasData } = useChartData(chunks, getter, filterZeros);
  const { width, height, isLargeDataset } = useChartDimensions(data.length);
  const colorConfig = COLOR_MAP[color];

  const dataset = useMemo(() => ({
    data,
    borderColor: colorConfig.border,
    backgroundColor: colorConfig.background,
    pointBorderColor: colorConfig.border,
    pointHoverBackgroundColor: colorConfig.border,
    pointBackgroundColor: "#ffffff",
    pointHoverBorderColor: "#ffffff",
    tension: 0.3,
    borderWidth: isLargeDataset ? 1.5 : 2,
    pointRadius: 0,
    pointHoverRadius: 4,
    fill: true,
    cubicInterpolationMode: "monotone" as const,
  }), [data, colorConfig, isLargeDataset]);

  const chartOptions = useMemo(() => 
    reportLineChartOptions(data.length, new Date(startAt), colorConfig.border),
    [data.length, startAt, colorConfig.border]
  );

  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
    >
      {showStats && (
        <StatsSummary stats={stats} color={colorConfig.border} hasData={hasData} />
      )}
      
      {hasData ? (
        <div className="overflow-x-auto w-full">
          <div className="min-w-full" style={{ width }}>
            <Line
              data={{ datasets: [dataset] }}
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

OptimizedLineChart.displayName = "OptimizedLineChart";