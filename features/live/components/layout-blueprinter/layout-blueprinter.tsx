"use client";

import { Fragment } from "react";
import { PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Blueprint } from "~/types/blueprint";
import { useLayoutBlueprintStore } from "../../stores/layout-blueprinter";
import { EmptyState } from "./empty-state";
import { LayoutBlueprintColumn } from "./layout-blueprint-column";
import { LayoutBlueprintEditColumn } from "./layout-blueprint-edit-column";

type Props = {
  blueprint: Blueprint;
};

export const LayoutBluePrinter: React.FC<Props> = ({ blueprint }) => {
  const { isEditMode } = useLayoutBlueprintStore();

  return (
    <>
      {blueprint.columns.length === 0 ? (
        <EmptyState />
      ) : (
        <PanelGroup direction="horizontal" className="w-full flex-1">
          {blueprint.columns.map((col, index) => (
            <Fragment key={index}>
              {isEditMode ? (
                <LayoutBlueprintEditColumn column={col} index={index} />
              ) : (
                <LayoutBlueprintColumn column={col} />
              )}
              {index < blueprint.columns.length - 1 && (
                <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-500 transition-colors" />
              )}
            </Fragment>
          ))}
        </PanelGroup>
      )}
    </>
  );
};
