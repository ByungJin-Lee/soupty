import { ChartOptions } from "chart.js";

export const lineChartOptions: ChartOptions<"line"> = {
  // 반응형으로 설정
  responsive: true,
  // 데이터 변경 시 부드러운 애니메이션 효과
  animation: {
    duration: 500, // 0.5초 동안 애니메이션
  },
  scales: {
    y: {
      // Y축이 항상 0에서 시작하도록 설정합니다.
      beginAtZero: true,
      display: false,
      ticks: {
        padding: 100,
      },
    },
  },
  layout: {
    padding: {
      top: 20,
    },
  },
  // maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
      font: {
        weight: "bold",
        size: 17,
      },
    },
  },
};

export const doughnutChartOptions: ChartOptions<"doughnut"> = {
  // 반응형으로 설정
  responsive: true,
  // 데이터 변경 시 부드러운 애니메이션 효과
  animation: {
    duration: 500, // 0.5초 동안 애니메이션
  },
  plugins: {
    legend: {
      position: "top",
    },
    datalabels: {
      font: {
        weight: "bold",
        size: 18,
      },
    },
  },
};

export const totalTextPlugin = {
  id: "total-text",
  afterDraw: (chart) => {
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

export const wordCloudOptions = {
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
      // strokeStyle: "red",
      // strokeWidth: 8,
    },
  },
};
