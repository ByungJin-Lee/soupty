import { useCallback } from "react";
import { PopoverId, usePopoverStore } from "~/common/stores/popover-store";
import { MuteLogPopoverPayload } from "../types/mute-log";

export const useMuteLogPopoverDispatch = (
  payload?: MuteLogPopoverPayload | null
) => {
  const togglePopover = usePopoverStore((t) => t.togglePopover);

  return useCallback(
    (event: React.MouseEvent) => {
      if (!payload) return;

      togglePopover(PopoverId.MuteLog, "mute-log", event, payload);
    },
    [payload, togglePopover]
  );
};
