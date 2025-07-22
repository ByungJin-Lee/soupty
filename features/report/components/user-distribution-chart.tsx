import { useMemo } from "react";
import { Line } from "~/common/ui/chart";
import { ReportChunk } from "~/services/ipc/types";
import { lineChartOptions } from "./fixtures";

type Props = {
  chunks: ReportChunk[];
};

export const UserDistributionChart: React.FC<Props> = ({ chunks }) => {
  const values = useMemo(
    () => chunks.map((v, i) => ({ x: i, y: v.chat.totalCount })),
    [chunks]
  );

  return (
    <div className="overflow-x-scroll w-full">
      <Line
        data={{
          // labels: Array.from({ length: chunks.length }, (_, i) => i + 1),
          datasets: [
            {
              data: values,
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              pointBackgroundColor: "#ffffff",
              pointBorderColor: "#10b981",
              pointHoverBackgroundColor: "#10b981",
              pointHoverBorderColor: "#ffffff",
              tension: 0.4,
              borderWidth: 1,
              pointRadius: 0,
              fill: true,
            },
          ],
        }}
        width={values.length * 20}
        height={500}
        options={lineChartOptions(values.length)}
      />
    </div>
  );
};
