import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Chart } from "~/common/ui/chart";
import { wordCloudOptions } from "./fixtures";

export const WordCloud = () => {
  const d = useStatsEventStore((v) => v.wordCount.data);

  if (d.words.length === 0) return null;

  return (
    <Chart
      type="wordCloud"
      data={{
        labels: d.words.map((v) => v.word),
        datasets: [
          {
            label: "",
            data: d.words.map((v) => 10 + v.count * 10),
          },
        ],
      }}
      options={wordCloudOptions}
    />
  );
};
