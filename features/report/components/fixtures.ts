import { ChartOptions } from "chart.js";

export const lineChartOptions = (xMax: number): ChartOptions<"line"> => ({
  responsive: false,
  animation: false,
  parsing: false,
  // interaction: {
  //   mode: "nearest",
  //   axis: "x",
  //   intersect: false,
  // },
  spanGaps: true,
  scales: {
    x: {
      offset: false,
      type: "linear",
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        // display: false,
        maxRotation: 0,
        color: "#6b7280",
        autoSkip: true,
        font: {
          family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          size: 12,
        },
      },
      max: xMax,
    },
    y: {
      type: "linear",
      beginAtZero: true,
      display: false,
      suggestedMax: (context) => {
        const max = Math.max(
          ...(context.chart.data.datasets[0].data.map((d) => d.y) as number[])
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
    decimation: {
      enabled: true,
      algorithm: "min-max",
    },
    datalabels: {
      display: true,
      anchor: "end",
      align: "top",
      font: {
        weight: "bold",
        size: 12,
        // family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      color: "#374151",
      formatter: ({ y }: { y: number }) => {
        return y > 0 ? y : "";
      },
    },
    tooltip: {
      enabled: false,
    },
  },
  elements: {
    point: {
      // radius: 0,
      // radius: 6,
      // hoverRadius: 8,
      // borderWidth: 3,
      // backgroundColor: "#ffffff",
    },
    line: {
      tension: 0.4,
      // borderWidth: 3,
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
