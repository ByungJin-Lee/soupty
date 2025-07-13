import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Line } from "~/common/ui/chart";
import { lineChartOptions } from "./fixtures";

export const LOLChart = () => {
  useStatsEventStore((v) => v.lol.lastUpdated);
  const values = useStatsEventStore((v) => v.lol.data).getLatest(7);

  return (
    <div className="stats-chart">
      <Line
        data={{
          labels: values.map((v) => v.timeLabel),
          datasets: [
            {
              label: "웃음 지표",
              data: values.map((v) => v.count),
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              pointBackgroundColor: "#ffffff",
              pointBorderColor: "#f59e0b",
              pointHoverBackgroundColor: "#f59e0b",
              pointHoverBorderColor: "#ffffff",
              tension: 0.4,
              fill: true,
            },
          ],
        }}
        options={lineChartOptions}
      />
    </div>
  );
};
