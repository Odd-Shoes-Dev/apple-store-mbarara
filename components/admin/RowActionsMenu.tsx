import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

type Position = {
  top: number;
  bottom: number;
  left: number;
  openUp: boolean;
};

const MENU_WIDTH = 160;
const MENU_MARGIN = 4;

const RowActionsMenu = ({ actions }: Props) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleActions = actions.filter((a) => !a.hidden);

  const computePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    // Rendered through a portal, so this is just a rough estimate to decide
    // whether there's room below — not pixel-exact, but good enough to flip.
    const estimatedHeight = visibleActions.length * 36 + 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estimatedHeight + MENU_MARGIN && rect.top > estimatedHeight;

    setPosition({
      top: rect.bottom + MENU_MARGIN,
      bottom: window.innerHeight - rect.top + MENU_MARGIN,
      left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
      openUp,
    });
  };

  useEffect(() => {
    if (!open) return;
    computePosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const reposition = () => computePosition();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (visibleActions.length === 0) return null;

  const itemClass = (destructive?: boolean) =>
    `block w-full text-left px-4 py-2 text-sm ${
      destructive ? "text-rose-600 hover:bg-rose-50" : "text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <>
      <button
        ref={buttonRef}
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

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: position.openUp ? undefined : position.top,
              bottom: position.openUp ? position.bottom : undefined,
              left: position.left,
              width: MENU_WIDTH,
            }}
            className="bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-1 z-[1000]"
          >
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
          </div>,
          document.body
        )}
    </>
  );
};

export default RowActionsMenu;
