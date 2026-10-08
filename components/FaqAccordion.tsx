import { FunctionComponent } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqAccordionProps = {
  items: FaqItem[];
};

const FaqAccordion: FunctionComponent<FaqAccordionProps> = ({ items }) => {
  return (
    <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
      {items.map((item) => (
        <details key={item.question} className="group py-4">
          <summary className="flex items-center justify-between cursor-pointer list-none text-gray-900 font-medium text-sm sm:text-base">
            {item.question}
            <svg
              className="w-4 h-4 flex-shrink-0 ml-4 transition-transform duration-200 group-open:rotate-45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </summary>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">{item.answer}</p>
        </details>
      ))}
    </div>
  );
};

export default FaqAccordion;
