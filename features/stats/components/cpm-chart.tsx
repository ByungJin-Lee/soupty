import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Line } from "~/common/ui/chart";
import { lineChartOptions } from "./fixtures";

export const CPMChart = () => {
  useStatsEventStore((v) => v.cpm.lastUpdated);
  const values = useStatsEventStore((v) => v.cpm.data).getLatest(6);

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
            tension: 0.4,
            fill: true,
          },
        ],
      }}
      options={lineChartOptions}
      height={250}
    />
  );
};
