import { useReportLabelContext } from "../context/report-label-context";

export const ReportLabelToggle: React.FC = () => {
  const { labelType, setLabelType } = useReportLabelContext();

  const toggleLabelType = () => {
    setLabelType(labelType === "realtime" ? "vod-offset" : "realtime");
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">시간 표시</span>
      <button
        onClick={toggleLabelType}
        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
      >
        {labelType === "realtime" ? "실시간" : "VOD"}
      </button>
    </div>
  );
};
