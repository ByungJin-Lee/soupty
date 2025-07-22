import { ChartOptions } from "chart.js";

// 공통 X축 틱 설정
export const getCommonXAxisTicks = (xMax: number, startAt: Date) => ({
  display: true,
  maxRotation: 0,
  color: "#6b7280",
  autoSkip: true,
  maxTicksLimit: 20,
  stepSize: Math.max(1, Math.floor(xMax / 20)),
  font: {
    family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    size: 11,
  },
  callback: function (value: any) {
    const chunkIndex = Number(value);
    const timeFromStart = chunkIndex * 30 * 1000; // 30초 * 1000ms
    const currentTime = new Date(startAt.getTime() + timeFromStart);
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    const seconds = currentTime.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  },
});

// 공통 Y축 틱 설정
export const getCommonYAxisTicks = () => ({
  color: "#6b7280",
  font: {
    family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    size: 11,
  },
  maxTicksLimit: 8,
});

// 공통 tooltip 제목 콜백
export const getCommonTooltipTitle = (startAt: Date) => (tooltipItems: any[]) => {
  const chunkIndex = tooltipItems[0].dataIndex;
  const timeFromStart = chunkIndex * 30 * 1000; // 30초 * 1000ms
  const currentTime = new Date(startAt.getTime() + timeFromStart);
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const seconds = currentTime.getSeconds().toString().padStart(2, "0");
  return `시간: ${hours}:${minutes}:${seconds}`;
};

// 공통 decimation 설정
export const getCommonDecimation = (xMax: number) => ({
  enabled: xMax > 1000,
  algorithm: "lttb" as const,
  samples: Math.min(1000, xMax),
  threshold: Math.min(500, xMax / 2),
});

export const reportLineChartOptions = (
  xMax: number,
  startAt: Date,
  borderColor: string = "#10b981"
): ChartOptions<"line"> => ({
  responsive: false,
  animation: false,
  parsing: false,
  interaction: {
    mode: "nearest",
    axis: "x",
    intersect: false,
  },
  spanGaps: true,
  scales: {
    x: {
      offset: false,
      type: "linear",
      display: true,
      grid: {
        display: false,
      },
      ticks: getCommonXAxisTicks(xMax, startAt),
      max: xMax,
    },
    y: {
      type: "linear",
      beginAtZero: true,
      display: true,
      position: "left",
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.05)",
        lineWidth: 1,
      },
      ticks: getCommonYAxisTicks(),
      suggestedMax: (context: any) => {
        const max = Math.max(
          ...(context.chart.data.datasets[0].data.map((d: any) => d.y) as number[])
        );
        return max * 1.1;
      },
    },
  },
  layout: {
    padding: {
      top: 20,
      bottom: 10,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    decimation: getCommonDecimation(xMax),
    datalabels: {
      display: (context: any) => {
        const dataLength = context.chart.data.datasets[0].data.length;
        const sampleRate = Math.max(1, Math.floor(dataLength / 50));
        const yValue = context.dataset.data[context.dataIndex]?.y || 0;
        return context.dataIndex % sampleRate === 0 && yValue > 0;
      },
      anchor: "end",
      align: "top",
      font: {
        weight: "bold",
        size: 10,
        family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      color: "#374151",
      formatter: (_value: any, context: any) => {
        const yValue = context.dataset.data[context.dataIndex]?.y || 0;
        return yValue > 0 ? yValue.toLocaleString() : "";
      },
      offset: 4,
    },
    tooltip: {
      enabled: true,
      mode: "nearest",
      intersect: false,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor,
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: false,
      callbacks: {
        title: getCommonTooltipTitle(startAt),
        label: (context: any) => {
          const value = context.dataset.data[context.dataIndex]?.y || 0;
          return `값: ${value.toLocaleString()}`;
        },
      },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 4,
      borderWidth: 2,
      backgroundColor: "#ffffff",
      hoverBackgroundColor: "#ffffff",
      hoverBorderWidth: 2,
    },
    line: {
      tension: 0.3,
      borderWidth: 2,
    },
  },
});

export const userDistributionChartOptions = (
  xMax: number,
  startAt: Date
): ChartOptions<"line"> => ({
  responsive: false,
  animation: false,
  parsing: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  spanGaps: true,
  scales: {
    x: {
      offset: false,
      type: "linear",
      display: true,
      grid: {
        display: false,
      },
      ticks: getCommonXAxisTicks(xMax, startAt),
      max: xMax,
    },
    y: {
      type: "linear",
      beginAtZero: true,
      display: true,
      position: "left",
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.05)",
        lineWidth: 1,
      },
      ticks: getCommonYAxisTicks(),
    },
  },
  layout: {
    padding: {
      top: 20,
      bottom: 10,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    decimation: getCommonDecimation(xMax),
    datalabels: {
      display: false,
    },
    tooltip: {
      enabled: true,
      mode: "index",
      intersect: false,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor: "#6366f1",
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      callbacks: {
        title: getCommonTooltipTitle(startAt),
        label: (context: any) => {
          const value = context.dataset.data[context.dataIndex]?.y || 0;
          const labelMap: { [key: string]: string } = {
            "전체 유니크": "총합",
            "구독자": "구독자",
            "팬": "팬",
            "일반": "일반",
          };
          const label = labelMap[context.dataset.label] || context.dataset.label;
          return `${label}: ${value.toLocaleString()}`;
        },
      },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 4,
      borderWidth: 2,
      backgroundColor: "#ffffff",
      hoverBackgroundColor: "#ffffff",
      hoverBorderWidth: 2,
    },
    line: {
      tension: 0.3,
      borderWidth: 2,
    },
  },
});

export const doughnutChartOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  animation: {
    duration: 800,
    easing: "easeOutQuart",
  },
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        padding: 20,
        font: {
          family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          size: 14,
          weight: 500,
        },
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    datalabels: {
      font: {
        weight: "bold",
        size: 16,
        family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      color: "#000",
      formatter: (value: number) => {
        return `${value}명`;
      },
    },
  },
  elements: {
    arc: {
      borderWidth: 1,
      borderColor: "#000",
    },
  },
};

export const totalTextPlugin = {
  id: "total-text",
  afterDraw: (chart: any) => {
    const ctx = chart.ctx;
    const { top, left, width, height } = chart.chartArea;
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // 데이터의 총 합계 계산
    const total = chart.data.datasets[0].data.reduce(
      (sum: number, value: number) => sum + value,
      0
    );

    ctx.save();

    // 합계 텍스트 스타일
    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, centerX, centerY - 10); // 숫자 위치 (살짝 위로)

    // "합계" 라벨 텍스트 스타일
    ctx.font = "normal 16px sans-serif";
    ctx.fillStyle = "#666";
    ctx.fillText("합계", centerX, centerY + 20); // "합계" 텍스트 위치 (살짝 아래로)

    ctx.restore();
  },
};

export const wordCloudOptions: ChartOptions<"wordCloud"> = {
  responsive: true,
  animation: {
    duration: 1000,
  },
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
      display: false,
    },
  },
  elements: {
    word: {
      strokeStyle: "#ffffff",
      strokeWidth: 1,
      minRotation: -30,
      maxRotation: 30,
      color: (ctx) => {
        const colors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"];
        return colors[ctx.dataIndex % colors.length];
      },
      hoverColor: "#333333",
      font: {
        family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        weight: "600",
      },
    },
  },
};