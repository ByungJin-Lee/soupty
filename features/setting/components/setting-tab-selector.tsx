import { useCallback } from "react";
import { SettingType } from "../types/tab";

type Props = {
  currentTab: SettingType;
  onChange(tab: SettingType): void;
};

const tabs: { tab: SettingType; label: string }[] = [
  {
    tab: "app",
    label: "앱",
  },
  {
    tab: "favorites",
    label: "즐겨찾기",
  },
];

export const SettingTabSelector: React.FC<Props> = ({
  currentTab,
  onChange,
}) => {
  const handleChangeTab = useCallback(
    (tab: SettingType) => {
      if (tab === currentTab) return;
      onChange(tab);
    },
    [currentTab, onChange]
  );

  return (
    <div className="flex border-b border-gray-200 mb-2">
      {tabs.map((t) => (
        <button
          key={t.tab}
          onClick={() => handleChangeTab(t.tab)}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            currentTab === t.tab
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
