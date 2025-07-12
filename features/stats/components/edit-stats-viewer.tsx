import { Plus, X } from "react-feather";
import { StatsType } from "~/types/stats";
import { StatsDescriptions } from "../constants";

type EditStatsViewerProps = {
  components: StatsType[];
  onComponentsChange: (components: StatsType[]) => void;
};

export const EditStatsViewer: React.FC<EditStatsViewerProps> = ({
  components,
  onComponentsChange,
}) => {
  const availableStats = Object.values(StatsType).filter(
    (type) => !components.includes(type)
  );

  const addStat = (statsType: StatsType) => {
    onComponentsChange([...components, statsType]);
  };

  const removeStat = (statsType: StatsType) => {
    onComponentsChange(components.filter((type) => type !== statsType));
  };

  return (
    <div className="bg-gray-50 p-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          통계 뷰어 편집
        </h3>
        <p className="text-sm text-gray-600">
          표시할 통계 컴포넌트를 추가하거나 제거하세요.
        </p>
      </div>

      {/* 현재 추가된 통계들 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          현재 통계 ({components.length})
        </h4>
        <div className="space-y-2">
          {components.map((statsType) => (
            <div
              key={statsType}
              className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
            >
              <span className="text-sm text-gray-900">
                {StatsDescriptions[statsType].text}
              </span>
              <button
                onClick={() => removeStat(statsType)}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                title="통계 제거"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {components.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              추가된 통계가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 추가 가능한 통계들 */}
      {availableStats.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">통계 추가</h4>
          <div className="space-y-2">
            {availableStats.map((statsType) => (
              <button
                key={statsType}
                onClick={() => addStat(statsType)}
                className="w-full flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm text-gray-900">
                  {StatsDescriptions[statsType].text}
                </span>
                <Plus size={16} className="text-blue-500" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
