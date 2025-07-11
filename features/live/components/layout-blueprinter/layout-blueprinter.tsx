import { Fragment } from "react";
import { PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Blueprint } from "~/types/blueprint";
import { LayoutBlueprintColumn } from "./layout-blueprint-column";

type Props = {
  blueprint: Blueprint;
};

export const LayoutBluePrinter: React.FC<Props> = ({ blueprint }) => {
  return (
    <PanelGroup direction="horizontal" className="h-full w-full">
      {blueprint.columns.map((col, index) => (
        <Fragment key={`${col.type}-${index}`}>
          <LayoutBlueprintColumn column={col} />
          {index < blueprint.columns.length - 1 && (
            <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />
          )}
        </Fragment>
      ))}
    </PanelGroup>
  );
};
