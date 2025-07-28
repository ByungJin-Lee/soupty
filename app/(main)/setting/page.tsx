"use client";

import { useState } from "react";
import { AppSettingsTab } from "~/features/setting/components/app-settings-tab";
import { FavoritesSettingsTab } from "~/features/setting/components/favorites-settings-tab";
import { SettingTabSelector } from "~/features/setting/components/setting-tab-selector";
import { SettingType } from "~/features/setting/types/tab";

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState<SettingType>("app");

  return (
    <div className="p-2 flex flex-col flex-1 overflow-y-scroll invisible-scrollbar">
      <SettingTabSelector currentTab={activeTab} onChange={setActiveTab} />

      {activeTab === "app" && <AppSettingsTab />}
      {activeTab === "favorites" && <FavoritesSettingsTab />}
    </div>
  );
}
