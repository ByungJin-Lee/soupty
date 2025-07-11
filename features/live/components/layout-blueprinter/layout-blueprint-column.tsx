import { Panel } from "react-resizable-panels";
import { ChatViewer } from "~/features/chat/components/chat-viewer";
import { EventViewer } from "~/features/event/components/event-viewer";
import { StatsViewer } from "~/features/stats/components/stats-viewer";
import { BlueprintColumn, BlueprintColumnType } from "~/types/blueprint";

type Props = {
  column: BlueprintColumn;
};

export const LayoutBlueprintColumn: React.FC<Props> = ({ column }) => {
  return (
    <Panel minSize={10} className="overflow-y-scroll! invisible-scrollbar">
      <ColumnContent column={column} />
    </Panel>
  );
};

const ColumnContent: React.FC<Props> = ({ column }) => {
  switch (column.type) {
    case BlueprintColumnType.ChatViewer:
      return <ChatViewer />;
    case BlueprintColumnType.EventViewer:
      return <EventViewer />;
    case BlueprintColumnType.Blank:
      return <div className="h-full w-full bg-gray-200" />;
    case BlueprintColumnType.StatsViewer:
      return <StatsViewer types={column.components} />;
    default:
      return (
        <div className="h-full w-full bg-gray-200">Unknown Column Type</div>
      );
  }
};
