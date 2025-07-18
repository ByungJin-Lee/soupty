import { useCallback } from "react";
import { HistoryType } from "../types/tab";

type Props = {
  currentTab: HistoryType;
  onChange(tab: HistoryType): void;
};

const tabs: { tab: HistoryType; label: string }[] = [
  {
    tab: "chat",
    label: "채팅",
  },
  {
    tab: "event",
    label: "이벤트",
  },
];

export const HistoryTabSelector: React.FC<Props> = ({
  currentTab,
  onChange,
}) => {
  const handleChangeTab = useCallback(
    (tab: HistoryType) => {
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
