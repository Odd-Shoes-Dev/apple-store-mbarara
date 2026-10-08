import { FunctionComponent } from "react";

export type Tab = {
  label: string;
  value: string;
  count?: number;
};

export type TabPillsProps = {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
};

const TabPills: FunctionComponent<TabPillsProps> = ({ tabs, active, onChange }) => {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              isActive
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabPills;
