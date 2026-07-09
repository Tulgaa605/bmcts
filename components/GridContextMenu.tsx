'use client';

import { useEffect } from 'react';

export type ContextMenuItem =
  | { type: 'item'; label: string; onClick: () => void }
  | { type: 'separator' };

export default function GridContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [onClose]);

  return (
    <div
      className="fixed z-[9999] min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) =>
        item.type === 'separator' ? (
          <div key={i} className="my-1 border-t border-gray-100" />
        ) : (
          <button
            key={i}
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-nebo-primary hover:text-white"
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
