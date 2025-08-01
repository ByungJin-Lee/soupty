"use client";

import { Suspense } from "react";
import { useQueryParam } from "~/common/hooks";
import { BackButton } from "~/common/ui";
import { HistoryChatTab } from "~/features/history/components/history-chat-tab";
import { HistoryEventTab } from "~/features/history/components/history-event-tab";
import { HistoryTabSelector } from "~/features/history/components/history-tab-selector";
import { HistoryUserTab } from "~/features/history/components/history-user-tab";
import { HistoryType } from "~/features/history/types/tab";

export default function HistoryPage() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}

const PageContent = () => {
  const [activeTab, setActiveTab] = useQueryParam<HistoryType>("type", "chat");
  return (
    <div className="p-2 flex flex-col flex-1 overflow-y-scroll invisible-scrollbar">
      <div className="flex gap-2">
        <BackButton />
        {/* 탭 네비게이션 */}
        <HistoryTabSelector currentTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* 채팅 검색 탭 */}
      {activeTab === "chat" && <HistoryChatTab />}

      {/* 이벤트 검색 탭 */}
      {activeTab === "event" && <HistoryEventTab />}

      {/* 유저 검색 탭 */}
      {activeTab === "user" && <HistoryUserTab />}
    </div>
  );
};
