import { ChartOptions } from "chart.js";
import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Line } from "~/common/ui/chart";

const options: ChartOptions<"line"> = {
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
    },
  },
  plugins: {
    legend: {
      position: "top",
    },
  },
};

export const CPMChart = () => {
  useStatsEventStore((v) => v.cpm.lastUpdated);
  const values = useStatsEventStore((v) => v.cpm.data).getLatest(30);

  console.log(values);
  return (
    <Line
      data={{
        labels: values.map((v) => v.timeLabel),
        datasets: [
          {
            label: "CPM",
            data: values.map((v) => v.count),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      }}
      options={options}
    />
  );
};
