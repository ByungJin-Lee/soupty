"use client";

import { Popover } from "~/common/ui/popover";
import { ChatHeaderPopover } from "~/features/chat/components/chat-header-popover";

export const GlobalPopoverProvider: React.FC = () => {
  return (
    <Popover>
      <ChatHeaderPopover />
    </Popover>
  );
};