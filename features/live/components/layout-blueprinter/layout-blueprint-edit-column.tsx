import { Panel } from "react-resizable-panels";
import { MockChatViewer } from "~/features/chat/components/mock-chat-viewer";
import { MockEventViewer } from "~/features/event/components/mock-event-viewer";
import { EditStatsViewer } from "~/features/stats/components/edit-stats-viewer";
import { BlueprintColumn, BlueprintColumnType } from "~/types/blueprint";
import { useLayoutBlueprintStore } from "../../stores/layout-blueprinter";
import { ColumnHeader } from "./column-header";

export interface LayoutBlueprintEditColumnProps {
  column: BlueprintColumn;
  index: number;
}

export const LayoutBlueprintEditColumn: React.FC<LayoutBlueprintEditColumnProps> = ({
  column,
  index,
}) => {
  const { removeColumn, updateColumn } = useLayoutBlueprintStore();

  const handleRemove = () => {
    removeColumn(index);
  };

  const handleTypeChange = (newType: BlueprintColumnType) => {
    const newColumn: BlueprintColumn = {
      type: newType,
      width: column.width,
      ...(newType === BlueprintColumnType.StatsViewer && { components: [] }),
    } as BlueprintColumn;

    updateColumn(index, newColumn);
  };

  const handleStatsComponentsChange = (newComponents: any) => {
    if (column.type === BlueprintColumnType.StatsViewer) {
      const updatedColumn = {
        ...column,
        components: newComponents,
      };
      updateColumn(index, updatedColumn);
    }
  };

  return (
    <Panel className="overflow-y-scroll! invisible-scrollbar">
      <ColumnHeader
        column={column}
        onRemove={handleRemove}
        onTypeChange={handleTypeChange}
      />
      <EditColumnContent
        column={column}
        onStatsComponentsChange={handleStatsComponentsChange}
      />
    </Panel>
  );
};

const EditColumnContent: React.FC<{
  column: BlueprintColumn;
  onStatsComponentsChange: (components: any) => void;
}> = ({ column, onStatsComponentsChange }) => {
  switch (column.type) {
    case BlueprintColumnType.ChatViewer:
      return <MockChatViewer />;
    case BlueprintColumnType.EventViewer:
      return <MockEventViewer />;
    case BlueprintColumnType.Blank:
      return <div className="w-full bg-gray-200 p-4">Blank Column (Edit Mode)</div>;
    case BlueprintColumnType.StatsViewer:
      return (
        <EditStatsViewer
          components={column.components || []}
          onComponentsChange={onStatsComponentsChange}
        />
      );
    default:
      return <div className="w-full bg-gray-200 p-4">Unknown Column Type (Edit Mode)</div>;
  }
};