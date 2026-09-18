'use client';

import { useEffect, useState } from 'react';
import ExpenseForm from '@/components/ExpenseForm';

type Item = { id: number; code: string; name: string; unit: string; initial_qty: number; current_qty: number; price: number };

export default function ExpenseModal({ docNo, items }: { docNo: string; items: Item[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-nebo-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-nebo-dark"
      >
        Зарлага бүртгэх
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
          <button type="button" aria-label="Хаах" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-[81] max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-3xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-800">Зарлага бүртгэх</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-slate-50"
              >
                Хаах
              </button>
            </div>
            <ExpenseForm docNo={docNo} items={items} />
          </div>
        </div>
      )}
    </>
  );
}
