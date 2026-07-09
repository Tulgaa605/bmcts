'use client';

import { useState } from 'react';
import { createExpenseAction } from '@/actions/bm';

type Item = { id: number; code: string; name: string; unit: string; current_qty: number; price: number };

const PURPOSES = ['Албан хэрэгцээ', 'Үйлдвэрлэл', 'Засвар үйлчилгээ', 'Бусад'];

// Үлдэгдэл хүртэлх сонгох боломжтой тоонуудыг үүсгэнэ (select-д зориулж)
function buildQtyOptions(stock: number): number[] {
  const max = Math.floor(stock);
  if (max <= 0) return [];
  const opts: number[] = [];
  for (let i = 1; i <= Math.min(max, 50); i++) opts.push(i);
  for (let i = 60; i <= max; i += 10) opts.push(i);
  if (max > 50 && opts[opts.length - 1] !== max) opts.push(max);
  return opts;
}

export default function ExpenseForm({ docNo, items }: { docNo: string; items: Item[] }) {
  const [selected, setSelected] = useState<Item | null>(null);
  const [qty, setQty] = useState(0);
  const [purpose, setPurpose] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const price = selected?.price ?? 0;
  const total = qty * price;
  const qtyOptions = selected ? buildQtyOptions(selected.current_qty) : [];
  const ready = !!selected && qty > 0 && !!purpose;

  function onItemChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = parseInt(e.target.value);
    setSelected(items.find((i) => i.id === id) || null);
    setQty(0);
  }

  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';
  const selectCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-nebo-primary focus:outline-none focus:ring-2 focus:ring-nebo-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';
  const readCls = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700';

  return (
    <form action={createExpenseAction} className="space-y-5">
      <input type="hidden" name="doc_no" value={docNo} />
      <input type="hidden" name="doc_date" value={today} />
      <input type="hidden" name="price" value={price} />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500">
        <span>Баримт: <strong className="font-mono text-nebo-primary">{docNo}</strong></span>
        <span>Огноо: <strong className="text-gray-700">{today}</strong></span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Бараа материал *</label>
          <select name="item_id" required value={selected?.id ?? ''} onChange={onItemChange} className={selectCls}>
            <option value="">— Бараа сонгох —</option>
            {items.map((i) => (
              <option key={i.id} value={i.id} disabled={i.current_qty <= 0}>
                {i.code} · {i.name} {i.current_qty <= 0 ? '(үлдэгдэлгүй)' : `(үлд: ${i.current_qty} ${i.unit})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Тоо хэмжээ *</label>
          <select
            name="qty"
            required
            value={qty || ''}
            onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
            disabled={!selected}
            className={selectCls}
          >
            <option value="">— Сонгох —</option>
            {qtyOptions.map((q) => (
              <option key={q} value={q}>{q} {selected?.unit}</option>
            ))}
          </select>
          {selected && (
            <p className="mt-1 text-xs text-gray-400">Дээд тал нь {Math.floor(selected.current_qty)} {selected.unit}</p>
          )}
        </div>

        <div>
          <label className={labelCls}>Зориулалт *</label>
          <select name="purpose" required value={purpose} onChange={(e) => setPurpose(e.target.value)} className={selectCls}>
            <option value="">— Сонгох —</option>
            {PURPOSES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Нэгж үнэ</label>
          <div className={readCls}>{price ? price.toLocaleString() + ' ₮' : '—'}</div>
        </div>

        <div>
          <label className={labelCls}>Нэгж</label>
          <div className={readCls}>{selected?.unit ?? '—'}</div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-gray-500">Нийт дүн:</span>
          <span className="text-2xl font-bold text-nebo-primary">{total.toLocaleString()} ₮</span>
        </div>
        <button
          type="submit"
          disabled={!ready}
          className="w-full rounded-lg bg-nebo-primary px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nebo-dark disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          Зарлага бүртгэх
        </button>
      </div>
    </form>
  );
}
