import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Chart } from "~/common/ui/chart";
import { wordCloudOptions } from "./fixtures";
import { normalizeData } from "../utils";

export const WordCloud = () => {
  const d = useStatsEventStore((v) => v.wordCount.data);

  if (d.words.length === 0) return null;

  const clouds = d.words.slice(0, 20);

  return (
    <div>
      <Chart
        height={250}
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
