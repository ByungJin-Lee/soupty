import { X } from "react-feather";
import { BlueprintColumn, BlueprintColumnType } from "~/types/blueprint";

type ColumnHeaderProps = {
  column: BlueprintColumn;
  onRemove: () => void;
  onTypeChange: (type: BlueprintColumnType) => void;
};

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  onRemove,
  onTypeChange,
}) => {
  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
      <select
        value={column.type}
        onChange={(e) => onTypeChange(e.target.value as BlueprintColumnType)}
        className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200 cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.5rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.5em 1.5em",
          paddingRight: "2.5rem",
        }}
      >
        <option value={BlueprintColumnType.ChatViewer}>채팅 뷰어</option>
        <option value={BlueprintColumnType.EventViewer}>이벤트 뷰어</option>
        <option value={BlueprintColumnType.StatsViewer}>통계 뷰어</option>
        <option value={BlueprintColumnType.Blank}>빈 화면</option>
      </select>
      <button
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
        title="컬럼 제거"
      >
        <X size={14} />
      </button>
    </div>
  );
};
