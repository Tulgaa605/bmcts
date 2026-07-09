'use client';

import { useState } from 'react';
import { createInventoryAction } from '@/actions/bm';

export default function InventoryForm({ docNo, items }: { docNo: string; items: { id: number; code: string; name: string; current_qty: number }[] }) {
  const [bookQty, setBookQty] = useState('');
  const [diff, setDiff] = useState('');

  function onItemChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const opt = e.target.selectedOptions[0];
    const qty = opt?.dataset.qty || '';
    setBookQty(qty);
    setDiff('');
  }

  function onActualChange(e: React.ChangeEvent<HTMLInputElement>) {
    const book = parseFloat(bookQty) || 0;
    const actual = parseFloat(e.target.value) || 0;
    setDiff((actual - book).toFixed(2));
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <form action={createInventoryAction} className="flex flex-wrap items-end gap-3">
      <div><label className="mb-1 block text-xs font-semibold text-gray-500">Баримтын дугаар</label><input name="doc_no" defaultValue={docNo} readOnly className="input-field w-36 bg-gray-50" /></div>
      <div><label className="mb-1 block text-xs font-semibold text-gray-500">Огноо</label><input name="doc_date" type="date" defaultValue={today} required className="input-field w-36" /></div>
      <div><label className="mb-1 block text-xs font-semibold text-gray-500">Бараа</label>
        <select name="item_id" required onChange={onItemChange} className="input-field w-56">
          <option value="">Сонгох...</option>
          {items.map(i => <option key={i.id} value={i.id} data-qty={i.current_qty}>{i.code} - {i.name} (номын үлд: {i.current_qty})</option>)}
        </select>
      </div>
      <div><label className="mb-1 block text-xs font-semibold text-gray-500">Номын үлдэгдэл</label><input readOnly value={bookQty} className="input-field w-28 bg-gray-50" /></div>
      <div><label className="mb-1 block text-xs font-semibold text-gray-500">Бодит үлдэгдэл</label><input name="actual_qty" type="number" step="0.01" required onChange={onActualChange} className="input-field w-28" /></div>
      <div><label className="mb-1 block text-xs font-semibold text-gray-500">Зөрүү</label><input readOnly value={diff} className="input-field w-28 bg-gray-50" /></div>
      <div><label className="mb-1 block text-xs font-semibold text-gray-500">Тайлбар</label><input name="note" className="input-field w-36" /></div>
      <button type="submit" className="btn-primary">Бүртгэх</button>
    </form>
  );
}
