'use client';

import { useEffect, useState } from 'react';
import CalcTotalForm from '@/components/CalcTotalForm';
import { createIncomeAction } from '@/actions/bm';

type Item = { id: number; code: string; name: string; unit: string };

export default function IncomeModal({
  docNo,
  today,
  items,
}: {
  docNo: string;
  today: string;
  items: Item[];
}) {
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
        Орлого бүртгэх
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
          <button type="button" aria-label="Хаах" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-[81] max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-3xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-800">Орлого бүртгэх</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-slate-50"
              >
                Хаах
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-amber-600">Эхлээд «БМ нэр, эхний үлдэгдэл бүртгэл» дээр бараа нэмнэ үү.</p>
            ) : (
              <CalcTotalForm action={createIncomeAction}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Баримтын дугаар</label>
                    <input name="doc_no" defaultValue={docNo} readOnly className="input-field bg-gray-50" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Огноо</label>
                    <input name="doc_date" type="date" defaultValue={today} required className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Бараа</label>
                    <select name="item_id" required className="input-field">
                      <option value="">Сонгох...</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>{i.code} - {i.name} ({i.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Тоо хэмжээ</label>
                    <input name="qty" type="number" step="0.01" min="0.01" required className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Үнэ</label>
                    <input name="price" type="number" step="0.01" min="0" required className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Хаанаас</label>
                    <input name="supplier" className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Тайлбар</label>
                    <input name="note" className="input-field" />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full sm:w-auto">Бүртгэх</button>
              </CalcTotalForm>
            )}
          </div>
        </div>
      )}
    </>
  );
}
