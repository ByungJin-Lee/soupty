import { ChartOptions as DoughnutChartOptions } from "chart.js";
import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Doughnut } from "~/common/ui/chart";
import { ActiveViewerStats } from "~/types/stats";

const totalTextPlugin = {
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

const options: DoughnutChartOptions<"doughnut"> = {
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
    title: {
      display: true,
      text: "Zustand 실시간 도넛 차트",
    },
  },
};

export const ActiveViewerChart = () => {
  const v = useStatsEventStore((v) => v.activeViewers);

  return (
    <Doughnut
      plugins={[totalTextPlugin]}
      options={options}
      data={{
        labels: ["팬", "구독", "일반"],
        datasets: [
          {
            label: "활성자 수",
            data: aggregate(v.data),
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 1,
          },
        ],
      }}
    />
  );
};

export const aggregate = (stats: ActiveViewerStats) => [
  stats.fan,
  stats.subscriber,
  stats.normal,
];
