import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import { ReportChunk } from "~/services/ipc/types";
import { useReportLabelContext } from "../context/report-label-context";
import { colors, connectGrouper } from "./fixtures";

type Props = {
  chunks: ReportChunk[];
  getter: (chunk: ReportChunk) => number;
  startAt: string;
  color?: "red" | "green" | "blue" | "yellow";
  hideSum?: boolean;
};

export const ReportLineChart: React.FC<Props> = ({
  chunks,
  getter,
  color = "green",
  hideSum = false,
}) => {
  const getChartLabel = useReportLabelContext().getCurrentLabel;

  const chartData = useMemo(
    () => chunks.map((chunk) => [getChartLabel(chunk), getter(chunk)]),
    [chunks, getter, getChartLabel]
  );

  const colorMap = useMemo(() => colors[color], [color]);

  const stats = useMemo(() => {
    const values = chartData.map(([, value]) => value as number);
    const nonZeroValues = values.filter((v) => v > 0);

    if (nonZeroValues.length === 0) {
      return { min: 0, max: 0, avg: 0, sum: 0 };
    }

    const min = Math.min(...nonZeroValues);
    const max = Math.max(...nonZeroValues);
    const sum = nonZeroValues.reduce((acc, v) => acc + v);
    const avg = Math.round(sum / nonZeroValues.length);

    return { min, max, avg, sum };
  }, [chartData]);

  const echartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        position: function (pt: [number, string]) {
          return [pt[0], "10%"];
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (params: any) {
          const param = params[0];
          const time = param.data[0];
          const value = param.data[1];
          return `시간: ${time}<br/>값: ${value.toLocaleString()}`;
        },
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
        axisLabel: {
          formatter: function (value: number) {
            return value;
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
          end: chartData.length > 1000 ? 10 : 100,
        },
        {
          start: 0,
          end: chartData.length > 1000 ? 10 : 100,
        },
      ],
      series: [
        {
          name: "Data",
          type: "line",
          symbol: "none",
          sampling: "lttb",
          itemStyle: {
            color: colorMap.border,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: colorMap.border,
                },
                {
                  offset: 1,
                  color: colorMap.background,
                },
              ],
            },
          },
          data: chartData,
        },
      ],
    };
  }, [chartData, colorMap]);

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
        {!hideSum && (
          <div className="text-center">
            <div
              className="font-semibold  text-lg"
              style={{ color: colorMap.border }}
            >
              {stats.sum.toLocaleString()}
            </div>
            <div className="text-xs">총합</div>
          </div>
        )}
      </div>

      {/* 차트 */}
      <div className="w-full">
        <ReactECharts
          onChartReady={connectGrouper}
          option={echartsOption}
          style={{ height: 250 }}
          opts={{ renderer: "canvas" }}
        />
      </div>
    </div>
  );
};
