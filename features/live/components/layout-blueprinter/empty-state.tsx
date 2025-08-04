import { Edit3, Plus } from "react-feather";
import { BlueprintColumnType } from "~/types/blueprint";
import { useLayoutBlueprintStore } from "../../stores/layout-blueprinter";

export const EmptyState: React.FC = () => {
  const { addColumn, isEditMode } = useLayoutBlueprintStore();

  const handleAddColumn = () => {
    addColumn({
      type: BlueprintColumnType.Blank,
    });
  };

  return (
    <div className="flex items-center justify-center text-gray-500">
      <div className="text-center">
        <p>
          오른쪽 위 <Edit3 className="inline" /> 아이콘을 클릭하세요.
        </p>
        {isEditMode && (
          <button
            onClick={handleAddColumn}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} />열 추가
          </button>
        )}
      </div>
    </div>
  );
};
