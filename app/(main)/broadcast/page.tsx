"use client";

import { PaginationProvider } from "~/common/ui/pagination-provider";
import { BroadcastSessionProvider } from "~/features/broadcast/components/broadcast-session-provider";
import { BroadcastSessionList } from "~/features/broadcast/components/broadcast-session-list";

export default function BroadcastPage() {
  return (
    <div className="p-2 flex flex-col flex-1 overflow-y-scroll invisible-scrollbar">
      <PaginationProvider>
        <BroadcastSessionProvider>
          <BroadcastSessionList />
        </BroadcastSessionProvider>
      </PaginationProvider>
    </div>
  );
}