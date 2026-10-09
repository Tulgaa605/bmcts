'use client';

import { useMemo, useState } from 'react';
import DeleteButton from '@/components/DeleteButton';
import { deleteExpenseAction } from '@/actions/bm';

type Row = {
  id: number;
  doc_no: string;
  doc_date: string;
  item_code: string;
  item_name: string;
  unit: string;
  qty: number;
  price: number;
  total: number;
  purpose: string;
  is_return: number | null;
};

export default function ExpenseHistory({ records }: { records: Row[] }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return records;
    return records.filter((r) =>
      [r.doc_no, r.doc_date, r.item_code, r.item_name, r.purpose].join(' ').toLowerCase().includes(s)
    );
  }, [q, records]);
  const totalSum = filtered.filter((r) => !r.is_return).reduce((s, r) => s + (r.total || 0), 0);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-gray-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h3 className="text-sm font-bold text-gray-700">Зарлагын түүх</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Хайх..."
            className="input-field sm:w-56"
          />
          <span className="text-xs text-gray-500 sm:text-sm">
            Нийт дүн: <strong className="text-nebo-primary">{totalSum.toLocaleString()} ₮</strong>
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500">
              {['Дугаар', 'Огноо', 'Код', 'Бараа', 'Тоо', 'Нэгж', 'Үнэ', 'Нийт', 'Хаашаа', ''].map((h, idx) => (
                <th key={idx} className={`px-4 py-3 font-semibold ${['Тоо', 'Үнэ', 'Нийт'].includes(h) ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                  {records.length === 0
                    ? 'Одоогоор зарлагын бичлэг алга. Баруун дээд «Зарлага бүртгэх» товчоор бүртгэнэ.'
                    : 'Хайлтад тохирох бичлэг алга.'}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.doc_no}</td>
                  <td className="px-4 py-3 text-gray-600">{r.doc_date}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.item_code}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.item_name}</td>
                  <td className="px-4 py-3 text-right font-semibold">{r.qty}</td>
                  <td className="px-4 py-3 text-gray-500">{r.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{r.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-nebo-primary">{r.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${r.is_return ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-gray-600'}`}>
                      {r.purpose || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton action={deleteExpenseAction} id={r.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
