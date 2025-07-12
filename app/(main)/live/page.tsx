"use client";

import { LayoutBluePrinter } from "~/features/live/components/layout-blueprinter";
import { useLayoutBlueprintStore } from "~/features/live/stores/layout-blueprinter";

export default function LivePage() {
  const { blueprint } = useLayoutBlueprintStore();

  return <LayoutBluePrinter blueprint={blueprint} />;
}
