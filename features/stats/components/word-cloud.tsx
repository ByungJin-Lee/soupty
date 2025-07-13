import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Chart } from "~/common/ui/chart";
import { normalizeData } from "../utils";
import { wordCloudOptions } from "./fixtures";

export const WordCloud = () => {
  const d = useStatsEventStore((v) => v.wordCount.data);

  if (d.words.length === 0) return null;

  const clouds = d.words.slice(0, 20);

  return (
    <div className="stats-chart">
      <Chart
        type="wordCloud"
        data={{
          labels: clouds.map((v) => v.word),
          datasets: [
            {
              label: "",
              data: normalizeData(clouds.map((v) => v.count)),
            },
          ],
        }}
        options={wordCloudOptions}
      />
    </div>
  );
};
