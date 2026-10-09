import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type RowAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
  hidden?: boolean;
};

type Props = {
  actions: RowAction[];
};

const RowActionsMenu = ({ actions }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const visibleActions = actions.filter((a) => !a.hidden);
  if (visibleActions.length === 0) return null;

  const itemClass = (destructive?: boolean) =>
    `block w-full text-left px-4 py-2 text-sm ${
      destructive ? "text-rose-600 hover:bg-rose-50" : "text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Open actions menu"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-1 z-20">
          {visibleActions.map((action) =>
            action.href ? (
              <Link key={action.label} href={action.href} passHref>
                <a onClick={() => setOpen(false)} className={itemClass(action.destructive)}>
                  {action.label}
                </a>
              </Link>
            ) : (
              <button
                key={action.label}
                onClick={() => {
                  setOpen(false);
                  action.onClick?.();
                }}
                className={itemClass(action.destructive)}
              >
                {action.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default RowActionsMenu;
