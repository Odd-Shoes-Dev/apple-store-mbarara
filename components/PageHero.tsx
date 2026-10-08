import { FunctionComponent, ReactNode } from "react";

export type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  pills?: string[];
  children?: ReactNode;
};

const PageHero: FunctionComponent<PageHeroProps> = ({ eyebrow, title, subtitle, pills, children }) => {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-5 lg:px-0 py-14 lg:py-20 flex flex-col lg:flex-row lg:items-center gap-10">
        <div className="flex-1">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#c9a15a" }}
          >
            {eyebrow}
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-base text-gray-500 max-w-md">{subtitle}</p>
          )}
          {pills && pills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {pills.map((pill) => (
                <span
                  key={pill}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700"
                >
                  {pill}
                </span>
              ))}
            </div>
          )}
        </div>
        {children && (
          <div className="flex-1 flex items-center justify-center">{children}</div>
        )}
      </div>
    </section>
  );
};

export default PageHero;
