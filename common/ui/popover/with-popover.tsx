"use client";

import React from "react";
import { usePopoverStore, PopoverId } from "~/common/stores/popover-store";

export interface PopoverContentProps<T = unknown> {
  payload: T;
}

export function withPopover<T extends PopoverContentProps>(
  Component: React.ComponentType<T>,
  popoverId: PopoverId
): React.FC<Omit<T, keyof PopoverContentProps> & { payload?: unknown }> {
  const PopoverWrapper = React.memo((props: Omit<T, keyof PopoverContentProps> & { payload?: unknown }) => {
    const { id, payload } = usePopoverStore();

    if (id !== popoverId || !payload) {
      return null;
    }

    return <Component {...(props as T)} payload={payload} />;
  });

  PopoverWrapper.displayName = `withPopover(${Component.displayName || Component.name})`;

  return PopoverWrapper;
}