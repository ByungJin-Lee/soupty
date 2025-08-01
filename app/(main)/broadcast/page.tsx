"use client";

import { PaginationProvider } from "~/common/ui/pagination-provider";
import { BroadcastSessionList } from "~/features/broadcast/components/broadcast-session-list";
import { BroadcastSessionSearchProvider } from "~/features/broadcast/components/broadcast-session-search-provider";

export default function BroadcastPage() {
  return (
    <div className="p-2 flex flex-col flex-1 overflow-y-scroll invisible-scrollbar">
      <PaginationProvider>
        <BroadcastSessionSearchProvider>
          <BroadcastSessionList />
        </BroadcastSessionSearchProvider>
      </PaginationProvider>
    </div>
  );
}
