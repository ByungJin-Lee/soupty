import { useStatsEventStore } from "~/common/stores/stats-event-store";
import { Doughnut } from "~/common/ui/chart";

export const SentimentChart = () => {
  useStatsEventStore((v) => v.sentiment.lastUpdated);
  const sentimentData = useStatsEventStore((v) => v.sentiment.data);

  const data = {
    labels: ["긍정", "중립", "부정"],
    datasets: [
      {
        data: [
          sentimentData.positiveCount,
          sentimentData.neutralCount,
          sentimentData.negativeCount,
        ],
        backgroundColor: [
          "#10b981", // 긍정 - 초록색
          "#6b7280", // 중립 - 회색
          "#ef4444", // 부정 - 빨간색
        ],
        borderColor: ["#059669", "#4b5563", "#dc2626"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const ratio =
              sentimentData.totalCount > 0
                ? ((value / sentimentData.totalCount) * 100).toFixed(1)
                : "0.0";
            return `${label}: ${value}개 (${ratio}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="stats-chart">
      <div className="mb-4 text-center">
        <div className="text-sm text-gray-600 mb-2">
          최근 15초간 감정 분석 ({sentimentData.totalCount}개)
        </div>
        <div className="text-lg font-semibold">
          평균 점수: {sentimentData.averageScore.toFixed(2)}
        </div>
        <div className="text-xs text-gray-500">
          (-2.0: 매우 부정 ~ +2.0: 매우 긍정)
        </div>
      </div>
      <div style={{ height: "200px" }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};
