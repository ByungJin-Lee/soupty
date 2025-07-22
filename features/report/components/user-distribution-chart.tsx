import { useMemo } from "react";
import { Line } from "~/common/ui/chart";
import { ReportChunk } from "~/services/ipc/types";
import { userDistributionChartOptions } from "./fixtures";

type Props = {
  chunks: ReportChunk[];
  startAt: string;
};

export const UserDistributionChart: React.FC<Props> = ({ chunks, startAt }) => {
  const chartData = useMemo(() => {
    // 채팅 참여자들의 유형별 분포 (viewerCount와는 별개)
    const uniqueData = chunks.map((chunk, i) => ({ x: i, y: chunk.user.uniqueCount }));
    const subscriberData = chunks.map((chunk, i) => ({ x: i, y: chunk.user.subscriberCount }));
    const fanData = chunks.map((chunk, i) => ({ x: i, y: chunk.user.fanCount }));
    const normalData = chunks.map((chunk, i) => ({ x: i, y: chunk.user.normalCount }));

    return { uniqueData, subscriberData, fanData, normalData };
  }, [chunks]);

  const chartWidth = useMemo(() => {
    const baseWidth = Math.max(1600, chunks.length * 9);
    return Math.min(baseWidth, chunks.length * 45);
  }, [chunks.length]);

  const stats = useMemo(() => {
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

    return {
      unique: calculateStats(chartData.uniqueData),
      subscriber: calculateStats(chartData.subscriberData),
      fan: calculateStats(chartData.fanData),
      normal: calculateStats(chartData.normalData),
    };
  }, [chartData]);

  const datasets = useMemo(() => [
    {
      label: "전체 유니크",
      data: chartData.uniqueData,
      borderColor: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#6366f1",
      pointHoverBackgroundColor: "#6366f1",
      pointHoverBorderColor: "#ffffff",
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: false,
    },
    {
      label: "구독자",
      data: chartData.subscriberData,
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#10b981",
      pointHoverBackgroundColor: "#10b981",
      pointHoverBorderColor: "#ffffff",
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: false,
    },
    {
      label: "팬",
      data: chartData.fanData,
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#f59e0b",
      pointHoverBackgroundColor: "#f59e0b",
      pointHoverBorderColor: "#ffffff",
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: false,
    },
    {
      label: "일반",
      data: chartData.normalData,
      borderColor: "#6b7280",
      backgroundColor: "rgba(107, 114, 128, 0.1)",
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#6b7280",
      pointHoverBackgroundColor: "#6b7280",
      pointHoverBorderColor: "#ffffff",
      tension: 0.3,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      fill: false,
    },
  ], [chartData]);

  return (
    <div className="w-full space-y-4">
      {/* 통계 정보 */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div className="text-center bg-indigo-50 rounded-lg p-3">
          <div className="font-semibold text-indigo-600 text-lg">
            {stats.unique.avg.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">채팅 참여자 평균</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.unique.min.toLocaleString()} ~ {stats.unique.max.toLocaleString()}
          </div>
        </div>
        
        <div className="text-center bg-emerald-50 rounded-lg p-3">
          <div className="font-semibold text-emerald-600 text-lg">
            {stats.subscriber.avg.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">구독자 평균</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.subscriber.min.toLocaleString()} ~ {stats.subscriber.max.toLocaleString()}
          </div>
        </div>
        
        <div className="text-center bg-amber-50 rounded-lg p-3">
          <div className="font-semibold text-amber-600 text-lg">
            {stats.fan.avg.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">팬 평균</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.fan.min.toLocaleString()} ~ {stats.fan.max.toLocaleString()}
          </div>
        </div>
        
        <div className="text-center bg-gray-50 rounded-lg p-3">
          <div className="font-semibold text-gray-600 text-lg">
            {stats.normal.avg.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">일반 평균</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.normal.min.toLocaleString()} ~ {stats.normal.max.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-indigo-500"></div>
          <span>채팅 참여자</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-emerald-500"></div>
          <span>구독자</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-amber-500"></div>
          <span>팬</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-gray-500"></div>
          <span>일반</span>
        </div>
      </div>

      {/* 차트 */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-full" style={{ width: chartWidth }}>
          <Line
            data={{
              datasets,
            }}
            width={chartWidth}
            height={300}
            options={userDistributionChartOptions(chunks.length, new Date(startAt))}
          />
        </div>
      </div>
    </div>
  );
};