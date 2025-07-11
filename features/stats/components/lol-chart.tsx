import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Line } from "~/common/ui/chart";
import { lineChartOptions } from "./fixtures";

export const LOLChart = () => {
  useStatsEventStore((v) => v.lol.lastUpdated);
  const values = useStatsEventStore((v) => v.lol.data).getLatest(10);

  return (
    <div className="stats-chart">
      <Line
        data={{
          labels: values.map((v) => v.timeLabel),
          datasets: [
            {
              label: "웃음 지표",
              data: values.map((v) => v.count),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
          ],
        }}
        options={lineChartOptions}
        height={250}
      />
    </div>
  );
};
