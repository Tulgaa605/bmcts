'use client';

import { useState } from 'react';
import { createExpenseAction } from '@/actions/bm';

type Item = { id: number; code: string; name: string; unit: string; initial_qty: number; current_qty: number; price: number };
type OrgOpt = { id: number; name: string };
type DestOpt = { id: number; kind: string; name: string };

export default function ExpenseForm({
  docNo,
  items,
  orgs,
  destinations,
}: {
  docNo: string;
  items: Item[];
  orgs: OrgOpt[];
  destinations: DestOpt[];
}) {
  const [selected, setSelected] = useState<Item | null>(null);
  const [qty, setQty] = useState('');
  const [destination, setDestination] = useState('');
  const [docDate, setDocDate] = useState(() => new Date().toISOString().split('T')[0]);

  const price = selected?.price ?? 0;
  const qtyNum = parseFloat(qty) || 0;
  const total = qtyNum * price;
  const ready = !!selected && qtyNum > 0 && qtyNum <= (selected?.current_qty ?? 0) && !!destination;
  const duureg = destinations.filter((d) => d.kind === 'duureg');
  const sum = destinations.filter((d) => d.kind === 'sum');

  function onItemChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = parseInt(e.target.value);
    setSelected(items.find((i) => i.id === id) || null);
    setQty('');
  }

  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';
  const selectCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-nebo-primary focus:outline-none focus:ring-2 focus:ring-nebo-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400';
  const readCls = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700';

  return (
    <form action={createExpenseAction} className="space-y-5">
      <input type="hidden" name="doc_no" value={docNo} />
      <input type="hidden" name="price" value={price} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Баримт</label>
          <div className={readCls}><span className="font-mono text-nebo-primary">{docNo}</span></div>
        </div>
        <div>
          <label className={labelCls}>Огноо *</label>
          <input name="doc_date" type="date" required value={docDate} onChange={(e) => setDocDate(e.target.value)} className={selectCls} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Бараа материал *</label>
          <select name="item_id" required value={selected?.id ?? ''} onChange={onItemChange} className={selectCls}>
            <option value="">— Бараа сонгох —</option>
            {items.map((i) => (
              <option key={i.id} value={i.id} disabled={i.current_qty <= 0}>
                {i.code} · {i.name} {i.current_qty <= 0 ? '(үлдэгдэлгүй)' : `(эхний: ${i.initial_qty} / эцсийн: ${i.current_qty} ${i.unit})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Тоо хэмжээ *</label>
          <input
            name="qty"
            type="number"
            step="0.01"
            min="0.01"
            max={selected?.current_qty || undefined}
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            disabled={!selected}
            className={selectCls}
          />
          {selected && (
            <p className="mt-1 text-xs text-gray-400">Дээд тал нь {selected.current_qty} {selected.unit}</p>
          )}
        </div>

        <div>
          <label className={labelCls}>Хаашаа *</label>
          <select name="destination" required value={destination} onChange={(e) => setDestination(e.target.value)} className={selectCls}>
            <option value="">— Сонгох —</option>
            {orgs.length > 0 && (
              <optgroup label="Салбар">
                {orgs.map((o) => (
                  <option key={o.id} value={`org:${o.id}`}>{o.name}</option>
                ))}
              </optgroup>
            )}
            {duureg.length > 0 && (
              <optgroup label="Дүүрэг">
                {duureg.map((d) => (
                  <option key={d.id} value={`dest:${d.id}`}>{d.name}</option>
                ))}
              </optgroup>
            )}
            {sum.length > 0 && (
              <optgroup label="Сум">
                {sum.map((d) => (
                  <option key={d.id} value={`dest:${d.id}`}>{d.name}</option>
                ))}
              </optgroup>
            )}
          </select>
          {destination.startsWith('org:') && (
            <p className="mt-1 text-xs text-gray-400">
              Энэ барааг тэндээс авсан бол үлдэгдэл буцаалт болно. Шинээр илгээвэл нөгөө талд орлогоор орно.
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>Эхний үлдэгдэл</label>
          <div className={readCls}>{selected ? `${selected.initial_qty} ${selected.unit}` : '—'}</div>
        </div>

        <div>
          <label className={labelCls}>Эцсийн үлдэгдэл</label>
          <div className={readCls}>{selected ? `${selected.current_qty} ${selected.unit}` : '—'}</div>
        </div>

        <div>
          <label className={labelCls}>Нэгж үнэ</label>
          <div className={readCls}>{price ? price.toLocaleString() + ' ₮' : '—'}</div>
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className={labelCls}>Тайлбар</label>
          <input name="note" className={selectCls} />
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
