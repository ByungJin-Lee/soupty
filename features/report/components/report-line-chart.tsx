import { useMemo } from "react";
import { Line } from "~/common/ui/chart";
import { ReportChunk } from "~/services/ipc/types";
import { reportLineChartOptions } from "./fixtures";

type Props = {
  chunks: ReportChunk[];
  getter: (chunk: ReportChunk) => number;
  startAt: string;
  color?: "red" | "green" | "blue" | "yellow";
};

export const ReportLineChart: React.FC<Props> = ({
  chunks,
  getter,
  startAt,
  color = "green",
}) => {
  const values = useMemo(
    () => chunks.map((v, i) => ({ x: i, y: getter(v) })),
    [chunks, getter]
  );

  const chartWidth = useMemo(() => {
    const baseWidth = Math.max(1600, values.length * 9);
    return Math.min(baseWidth, values.length * 45);
  }, [values.length]);

  const colorMap = useMemo(() => {
    const colors = {
      red: { border: "#ef4444", background: "rgba(239, 68, 68, 0.1)" },
      green: { border: "#10b981", background: "rgba(16, 185, 129, 0.1)" },
      blue: { border: "#3b82f6", background: "rgba(59, 130, 246, 0.1)" },
      yellow: { border: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" },
    };
    return colors[color];
  }, [color]);

  const stats = useMemo(() => {
    const nonZeroValues = values.filter((v) => v.y > 0).map((v) => v.y);

    if (nonZeroValues.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    const min = Math.min(...nonZeroValues);
    const max = Math.max(...nonZeroValues);
    const avg = Math.round(
      nonZeroValues.reduce((sum, val) => sum + val, 0) / nonZeroValues.length
    );

    return { min, max, avg };
  }, [values]);

  const dynamicDataset = useMemo(
    () => ({
      data: values,
      borderColor: colorMap.border,
      backgroundColor: colorMap.background,
      pointBorderColor: colorMap.border,
      pointHoverBackgroundColor: colorMap.border,
      pointBackgroundColor: "#ffffff",
      pointHoverBorderColor: "#ffffff",
      tension: 0.3,
      borderWidth: values.length > 1000 ? 1.5 : 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: true,
      cubicInterpolationMode: "monotone" as const,
    }),
    [values, colorMap]
  );

  return (
    <div className="w-full space-y-4">
      {/* 통계 정보 */}
      <div className="flex justify-center space-x-8 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <div className="text-center">
          <div
            className="font-semibold text-lg"
            style={{ color: colorMap.border }}
          >
            {stats.min.toLocaleString()}
          </div>
          <div className="text-xs">최솟값</div>
        </div>
        <div className="text-center">
          <div
            className="font-semibold  text-lg"
            style={{ color: colorMap.border }}
          >
            {stats.avg.toLocaleString()}
          </div>
          <div className="text-xs">평균</div>
        </div>
        <div className="text-center">
          <div
            className="font-semibold  text-lg"
            style={{ color: colorMap.border }}
          >
            {stats.max.toLocaleString()}
          </div>
          <div className="text-xs">최댓값</div>
        </div>
      </div>

      {/* 차트 */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-full" style={{ width: chartWidth }}>
          <Line
            data={{
              datasets: [dynamicDataset],
            }}
            width={chartWidth}
            height={250}
            options={reportLineChartOptions(
              values.length,
              new Date(startAt),
              colorMap.border
            )}
          />
        </div>
      </div>
    </div>
  );
};
