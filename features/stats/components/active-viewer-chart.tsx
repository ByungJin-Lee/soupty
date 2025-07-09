import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Doughnut } from "~/common/ui/chart";
import { ActiveViewerStats } from "~/types/stats";
import { doughnutChartOptions, totalTextPlugin } from "./fixtures";

export const ActiveViewerChart = () => {
  const v = useStatsEventStore((v) => v.activeViewers);

  return (
    <Doughnut
      plugins={[totalTextPlugin]}
      options={doughnutChartOptions}
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
