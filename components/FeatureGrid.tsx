import { FunctionComponent, ReactNode } from "react";

export type FeatureItem = {
  icon: ReactNode;
  title: string;
  text: string;
};

export type FeatureGridProps = {
  items: FeatureItem[];
  columns?: 2 | 3;
};

const FeatureGrid: FunctionComponent<FeatureGridProps> = ({ items, columns = 3 }) => {
  const colsClass = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-5`}>
      {items.map((item) => (
        <div
          key={item.title}
          className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm"
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
            style={{ background: "#f5f5f7", color: "#1d1d1f" }}
          >
            {item.icon}
          </div>
          <h4 className="font-semibold text-gray-900 text-base">{item.title}</h4>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid;
