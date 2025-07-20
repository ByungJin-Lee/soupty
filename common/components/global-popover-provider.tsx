"use client";

import { Popover } from "~/common/ui/popover";
import { UserPopover } from "~/features/popover/components/user-popover";

export const GlobalPopoverProvider: React.FC = () => {
  return (
    <Popover>
      <UserPopover />
    </Popover>
  );
};
