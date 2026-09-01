import Header from '@/components/Header';
import Alert from '@/components/Alert';
import DeleteButton from '@/components/DeleteButton';
import ExpenseForm from '@/components/ExpenseForm';
import { getDbConfig, requireUser } from '@/lib/auth';
import { dbAll, nextDocNo } from '@/lib/db';
import { deleteExpenseAction } from '@/actions/bm';

export default async function ExpensePage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const config = await getDbConfig();
  const { msg } = await searchParams;
  const records = await dbAll<{ id: number; doc_no: string; doc_date: string; item_code: string; item_name: string; unit: string; qty: number; price: number; total: number; purpose: string }>(config, `
    SELECT e.*, b.code as item_code, b.name as item_name, b.unit FROM bm_expense e JOIN bm_items b ON e.item_id = b.id
    WHERE e.org_id = ? ORDER BY e.doc_date DESC, e.id DESC`, [user.org_id]);
  const items = await dbAll<{ id: number; code: string; name: string; unit: string; initial_qty: number; current_qty: number; price: number }>(config, 'SELECT id, code, name, unit, initial_qty, current_qty, initial_price as price FROM bm_items WHERE org_id = ? ORDER BY code', [user.org_id]);
  const docNo = await nextDocNo(config, 'ZAR', user.org_id);

  const totalSum = records.reduce((s, r) => s + (r.total || 0), 0);

  return (
    <>
      <Header user={user} activeMenu="bm" dbConnection={config?.label} />
      <div className="page-wrap">
        <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="page-title">Бараа материалын зарлага</h2>
            <p className="page-subtitle">Агуулахаас бараа зарлагадах бүртгэл</p>
          </div>
          <span className="w-fit rounded-full bg-nebo-primary/10 px-3 py-1 text-xs font-semibold text-nebo-primary">
            Нийт {records.length} бичлэг
          </span>
        </div>

        <Alert message={msg} />

        {items.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-bold text-gray-700">Үлдэгдэл</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Код</th>
                    <th className="px-4 py-3">Бараа</th>
                    <th className="px-4 py-3 text-right">Эхний үлдэгдэл</th>
                    <th className="px-4 py-3 text-right">Эцсийн үлдэгдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-xs">{i.code}</td>
                      <td className="px-4 py-2">{i.name}</td>
                      <td className="px-4 py-2 text-right">{i.initial_qty} {i.unit}</td>
                      <td className="px-4 py-2 text-right font-semibold text-nebo-primary">{i.current_qty} {i.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-5 sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-700">
            <span className="inline-block h-4 w-1 rounded bg-nebo-primary" />
            Шинэ зарлага бүртгэх
          </h3>
          <ExpenseForm docNo={docNo} items={items} />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-gray-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <h3 className="text-sm font-bold text-gray-700">Зарлагын түүх</h3>
            <span className="text-xs text-gray-500 sm:text-sm">Нийт дүн: <strong className="text-nebo-primary">{totalSum.toLocaleString()} ₮</strong></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500">
                  {['Дугаар','Огноо','Код','Бараа','Тоо','Нэгж','Үнэ','Нийт','Зориулалт',''].map((h, idx) => (
                    <th key={idx} className={`px-4 py-3 font-semibold ${['Тоо','Үнэ','Нийт'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                      Одоогоор зарлагын бичлэг алга. Дээрх формоор эхний зарлагаа бүртгээрэй.
                    </td>
                  </tr>
                ) : records.map(r => (
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
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-gray-600">{r.purpose || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-right"><DeleteButton action={deleteExpenseAction} id={r.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
