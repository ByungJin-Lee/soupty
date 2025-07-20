"use client";

import { useState } from "react";
import { HistoryChatTab } from "~/features/history/components/history-chat-tab";
import { HistoryEventTab } from "~/features/history/components/history-event-tab";
import { HistoryTabSelector } from "~/features/history/components/history-tab-selector";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "event">("chat");
  return (
    <div className="p-2 flex flex-col flex-1 overflow-y-scroll invisible-scrollbar">
      {/* 탭 네비게이션 */}
      <HistoryTabSelector currentTab={activeTab} onChange={setActiveTab} />

      {/* 채팅 검색 탭 */}
      {activeTab === "chat" && <HistoryChatTab />}

      {/* 이벤트 검색 탭 */}
      {activeTab === "event" && <HistoryEventTab />}
    </div>
  );
}
