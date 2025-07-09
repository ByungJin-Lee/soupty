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
  plugins: {
    legend: {
      position: "top",
    },
  },
};

export const LOLChart = () => {
  useStatsEventStore((v) => v.lol.lastUpdated);
  const values = useStatsEventStore((v) => v.lol.data).getAll();

  return (
    <Line
      data={{
        // labels: values.map((v) => v.timeLabel),
        datasets: [
          {
            label: "웃음 지표",
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
