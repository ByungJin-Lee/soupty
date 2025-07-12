"use client";

import { Edit3, Plus, Save } from "react-feather";
import { BlueprintColumnType } from "~/types/blueprint";
import { useLayoutBlueprintStore } from "../../stores/layout-blueprinter";

export const LayoutHeader: React.FC = () => {
  const { addColumn, isEditMode, toggleEditMode } = useLayoutBlueprintStore();

  const handleAddColumn = () => {
    addColumn({
      type: BlueprintColumnType.Blank,
      width: 300,
    });
  };

  return (
    <div className="flex items-center justify-end p-0.5 border-b border-gray-200 bg-gray-100">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleEditMode}
          className={`p-1 rounded transition-colors hover:bg-gray-600/10 text-gray-600`}
          title={isEditMode ? "완료" : "수정"}
        >
          {isEditMode ? <Save size={14} /> : <Edit3 size={14} />}
        </button>
        {isEditMode && (
          <button
            onClick={handleAddColumn}
            className="bg-blue-500 hover:bg-blue-600 gap-1 text-white flex items-center text-xs p-1 rounded"
            title="열 추가"
          >
            <Plus size={14} /> 열 추가
          </button>
        )}
      </div>
    </div>
  );
};
