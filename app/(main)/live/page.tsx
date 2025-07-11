"use client";

import { LayoutBluePrinter } from "~/features/live/components/layout-blueprinter/layout-blueprinter";
import { BlueprintColumnType } from "~/types/blueprint";
import { StatsType } from "~/types/stats";

export default function LivePage() {
  return (
    <LayoutBluePrinter
      blueprint={{
        columns: [
          {
            type: BlueprintColumnType.ChatViewer,
            width: 0,
          },
          {
            type: BlueprintColumnType.StatsViewer,
            width: 0,
            components: [StatsType.ActiveViewer, StatsType.ChatPerMinute],
          },
          {
            type: BlueprintColumnType.StatsViewer,
            width: 0,
            components: [StatsType.WordCount, StatsType.LOL],
          },
        ],
      }}
    />
  );
}
