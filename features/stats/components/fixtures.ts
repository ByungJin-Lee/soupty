import { ChartOptions } from "chart.js";

export const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  animation: {
    duration: 800,
    easing: "easeInOutQuart",
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        color: "#6b7280",
        font: {
          family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          size: 12,
        },
      },
    },
    y: {
      beginAtZero: true,
      display: false,
      suggestedMax: (context) => {
        const max = Math.max(
          ...(context.chart.data.datasets[0].data as number[])
        );
        return max * 1.3;
      },
      ticks: {
        padding: 100,
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
    datalabels: {
      display: true,
      anchor: "end",
      align: "top",
      font: {
        weight: "bold",
        size: 14,
        family: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      color: "#374151",
      formatter: (value: any) => (value > 0 ? value : ""),
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
    },
  },
  elements: {
    point: {
      radius: 6,
      hoverRadius: 8,
      borderWidth: 3,
      backgroundColor: "#ffffff",
    },
    line: {
      tension: 0.4,
      borderWidth: 3,
    },
  },
};

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
        const colors = [
          "#3498db",
          "#e74c3c",
          "#2ecc71",
          "#f39c12",
          "#9b59b6",
        ];
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
