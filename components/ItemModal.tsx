'use client';

import { useEffect, useState, useTransition } from 'react';
import { createItemAction } from '@/actions/bm';
import { importCtsItemsAction } from '@/actions/cts';
import { useRouter } from 'next/navigation';

export default function ItemModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ctsRaw, setCtsRaw] = useState('');
  const [ctsQty, setCtsQty] = useState('');
  const [status, setStatus] = useState('');
  const [pending, startTransition] = useTransition();

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

  function onCtsImport() {
    setStatus('');
    startTransition(async () => {
      const result = await importCtsItemsAction(ctsRaw, parseFloat(ctsQty) || 0);
      if ('error' in result && result.error) {
        setStatus(result.error);
        return;
      }
      const extra = result.errors?.length ? ` (${result.errors.slice(0, 2).join(', ')})` : '';
      setStatus(`${result.count} бараа CT-ээс татагдлаа${extra}`);
      setCtsRaw('');
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-nebo-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-nebo-dark"
      >
        Бараа нэмэх
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
          <button type="button" aria-label="Хаах" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-[81] max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-800">Бараа нэмэх</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-slate-50"
              >
                Хаах
              </button>
            </div>

            <form action={createItemAction} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Гараар</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Код *</label>
                  <input name="code" required className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Нэр *</label>
                  <input name="name" required className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Нэгж</label>
                  <input name="unit" defaultValue="ш" className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Эхний үлдэгдэл</label>
                  <input name="initial_qty" type="number" step="0.01" min="0" defaultValue={0} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Эхний үнэ</label>
                  <input name="initial_price" type="number" step="0.01" min="0" defaultValue={0} className="input-field" />
                </div>
              </div>
              <button type="submit" className="btn-primary">Хадгалах</button>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">CT QR / код</p>
              <textarea
                value={ctsRaw}
                onChange={(e) => setCtsRaw(e.target.value)}
                rows={3}
                placeholder="QR эсвэл кодыг нэг мөрөнд нэгээр нь оруулна"
                className="input-field font-mono text-xs"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="sm:w-40">
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Эхний үлдэгдэл (сонголт)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ctsQty}
                    onChange={(e) => setCtsQty(e.target.value)}
                    className="input-field"
                  />
                </div>
                <button
                  type="button"
                  disabled={pending || !ctsRaw.trim()}
                  onClick={onCtsImport}
                  className="btn-primary disabled:opacity-50"
                >
                  {pending ? 'Татаж байна...' : 'CT-ээс татах'}
                </button>
              </div>
              {status && <p className="mt-2 text-sm text-nebo-primary">{status}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
