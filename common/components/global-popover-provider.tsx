"use client";

import { Popover } from "~/common/ui/popover";
import { MuteLogPopover } from "~/features/popover/components/mute-log-popover";
import { UserPopover } from "~/features/popover/components/user-popover";

export const GlobalPopoverProvider: React.FC = () => {
  return (
    <Popover>
      <UserPopover />
      <MuteLogPopover />
    </Popover>
  );
};
