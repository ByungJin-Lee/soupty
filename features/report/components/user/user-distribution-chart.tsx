import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { ReportChunk, UserAnalysis } from "~/services/ipc/types";
import { connectGrouper } from "../fixtures";

type Props = {
  chunks: ReportChunk[];
  analysis: UserAnalysis;
  startAt: string;
};

export const UserDistributionChart: React.FC<Props> = ({
  chunks,
  analysis,
}) => {
  const chartData = useMemo(
    () =>
      chunks.reduce(
        (acc, chunk) => {
          acc.fan.push(chunk.user.fanCount);
          acc.labels.push(chunk.timestamp);
          acc.unique.push(chunk.user.uniqueCount);
          acc.normal.push(chunk.user.normalCount);
          acc.subscriber.push(chunk.user.subscriberCount);

          return acc;
        },
        { labels: [], unique: [], subscriber: [], fan: [], normal: [] } as {
          labels: string[];
          unique: number[];
          subscriber: number[];
          fan: number[];
          normal: number[];
        }
      ),
    [chunks]
  );

  const echartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        position: function (pt: [number, string]) {
          return [pt[0], "10%"];
        },
        formatter: function (params: any) {
          const time = new Date(params[0].axisValue).toLocaleTimeString();
          let result = `시간: ${time}<br/>`;
          params.forEach((param: any) => {
            result += `${
              param.seriesName
            }: ${param.value.toLocaleString()}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ["구독자", "팬", "일반", "채팅 참여자"],
        bottom: 0,
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: "none",
          },
          restore: {},
          saveAsImage: {},
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: chartData.labels,
        axisLabel: {
          formatter: function (value: number) {
            return new Date(value).toLocaleTimeString();
          },
        },
      },
      yAxis: {
        type: "value",
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: chunks.length > 1000 ? 10 : 100,
        },
        {
          start: 0,
          end: chunks.length > 1000 ? 10 : 100,
        },
      ],
      series: [
        {
          name: "구독자",
          type: "line",
          stack: "Total",
          symbol: "none",
          sampling: "lttb",
          itemStyle: {
            color: "#10b981",
          },
          areaStyle: {},
          data: chartData.subscriber,
        },
        {
          name: "팬",
          type: "line",
          stack: "Total",
          symbol: "none",
          sampling: "lttb",
          itemStyle: {
            color: "#f59e0b",
          },
          areaStyle: {},
          data: chartData.fan,
        },
        {
          name: "일반",
          type: "line",
          stack: "Total",
          symbol: "none",
          sampling: "lttb",
          itemStyle: {
            color: "#6b7280",
          },
          areaStyle: {},
          data: chartData.normal,
        },
        {
          name: "총합",
          type: "line",
          symbol: "none",
          sampling: "lttb",
          itemStyle: {
            color: "#6366f1",
          },
          lineStyle: {
            width: 1,
          },
          data: chartData.unique,
        },
      ],
    };
  }, [chartData, chunks.length]);

  return (
    <div className="w-full space-y-4">
      {/* 통계 정보 */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div className="text-center bg-indigo-50 rounded-lg p-3">
          <div className="font-semibold text-indigo-600 text-lg">
            {Math.round(analysis.unique.avg).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">채팅 참여자 평균</div>
          <div className="text-xs text-gray-500 mt-1">
            {analysis.unique.min.toLocaleString()} ~{" "}
            {analysis.unique.max.toLocaleString()}
          </div>
        </div>

        <div className="text-center bg-emerald-50 rounded-lg p-3">
          <div className="font-semibold text-emerald-600 text-lg">
            {Math.round(analysis.subscriber.avg).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">구독자 평균</div>
          <div className="text-xs text-gray-500 mt-1">
            {analysis.subscriber.min.toLocaleString()} ~{" "}
            {analysis.subscriber.max.toLocaleString()}
          </div>
        </div>

        <div className="text-center bg-amber-50 rounded-lg p-3">
          <div className="font-semibold text-amber-600 text-lg">
            {Math.round(analysis.fan.avg).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">팬 평균</div>
          <div className="text-xs text-gray-500 mt-1">
            {analysis.fan.min.toLocaleString()} ~{" "}
            {analysis.fan.max.toLocaleString()}
          </div>
        </div>

        <div className="text-center bg-gray-50 rounded-lg p-3">
          <div className="font-semibold text-gray-600 text-lg">
            {Math.round(analysis.normal.avg).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 mt-1">일반 평균</div>
          <div className="text-xs text-gray-500 mt-1">
            {analysis.normal.min.toLocaleString()} ~{" "}
            {analysis.normal.max.toLocaleString()}
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
      <div className="w-full">
        <ReactECharts
          onChartReady={connectGrouper}
          option={echartsOption}
          style={{ height: 300 }}
          opts={{ renderer: "canvas" }}
        />
      </div>
    </div>
  );
};
