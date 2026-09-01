import Header from '@/components/Header';
import { getDbConfig, requireUser, formatMoney } from '@/lib/auth';
import { dbAll, dbGet } from '@/lib/db';
import PrintButton from '@/components/PrintButton';
import YearFilter from '@/components/YearFilter';

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const user = await requireUser();
  const config = await getDbConfig();
  const params = await searchParams;
  const year = params.year || String(new Date().getFullYear());

  const stockReport = await dbAll<{ code: string; name: string; unit: string; initial_qty: number; initial_price: number; current_qty: number; total_value: number }>(config, `
    SELECT code, name, unit, initial_qty, initial_price, current_qty, (current_qty * initial_price) as total_value
    FROM bm_items WHERE org_id = ? ORDER BY code`, [user.org_id]);

  const incomeTotal = (await dbGet<{ t: number }>(config, "SELECT COALESCE(SUM(total),0) as t FROM bm_income WHERE org_id=? AND strftime('%Y',doc_date)=?", [user.org_id, year]))?.t || 0;
  const expenseTotal = (await dbGet<{ t: number }>(config, "SELECT COALESCE(SUM(total),0) as t FROM bm_expense WHERE org_id=? AND strftime('%Y',doc_date)=?", [user.org_id, year]))?.t || 0;
  const salesTotal = (await dbGet<{ t: number }>(config, "SELECT COALESCE(SUM(total),0) as t FROM bm_sales WHERE org_id=? AND strftime('%Y',doc_date)=?", [user.org_id, year]))?.t || 0;

  const movementReport = await dbAll<{ code: string; name: string; unit: string; current_qty: number; income_qty: number; expense_qty: number; sales_qty: number }>(config, `
    SELECT b.code, b.name, b.unit, b.current_qty,
      (SELECT COALESCE(SUM(qty),0) FROM bm_income WHERE item_id=b.id AND strftime('%Y',doc_date)=?) as income_qty,
      (SELECT COALESCE(SUM(qty),0) FROM bm_expense WHERE item_id=b.id AND strftime('%Y',doc_date)=?) as expense_qty,
      (SELECT COALESCE(SUM(qty),0) FROM bm_sales WHERE item_id=b.id AND strftime('%Y',doc_date)=?) as sales_qty
    FROM bm_items b WHERE b.org_id = ? ORDER BY b.code`, [year, year, year, user.org_id]);

  const totalValue = stockReport.reduce((s, r) => s + r.total_value, 0);

  return (
    <>
      <Header user={user} activeMenu="bm" dbConnection={config?.label} />
      <div className="page-wrap">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-nebo-primary">БМ тайлан</h2>
          <YearFilter year={year} />
        </div>
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[{ label: 'Нийт орлого', value: incomeTotal }, { label: 'Нийт зарлага', value: expenseTotal }, { label: 'Нийт борлуулалт', value: salesTotal }].map(c => (
            <div key={c.label} className="card text-center">
              <div className="text-sm text-gray-500">{c.label}</div>
              <div className="mt-2 text-2xl font-bold text-nebo-primary">{formatMoney(c.value)}</div>
            </div>
          ))}
        </div>
        <div className="card mb-4 overflow-x-auto">
          <h3 className="mb-3 text-sm font-semibold">Бараа материалын үлдэгдлийн тайлан</h3>
          <table className="w-full text-xs">
            <thead><tr className="bg-nebo-primary text-white">{['Код','Нэр','Нэгж','Эхний үлдэгдэл','Эхний үнэ','Эцсийн үлдэгдэл','Нийт үнэ'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
            <tbody>{stockReport.map(r => (
              <tr key={r.code} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{r.code}</td><td className="px-3 py-2">{r.name}</td><td className="px-3 py-2">{r.unit}</td>
                <td className="px-3 py-2 text-right">{r.initial_qty}</td><td className="px-3 py-2 text-right">{r.initial_price.toLocaleString()}</td>
                <td className="px-3 py-2 text-right font-bold">{r.current_qty}</td><td className="px-3 py-2 text-right">{formatMoney(r.total_value)}</td>
              </tr>
            ))}</tbody>
            <tfoot><tr className="bg-slate-50 font-bold"><td colSpan={6} className="px-3 py-2 text-right">Нийт:</td><td className="px-3 py-2 text-right">{formatMoney(totalValue)}</td></tr></tfoot>
          </table>
        </div>
        <div className="card overflow-x-auto">
          <h3 className="mb-3 text-sm font-semibold">Бараа материалын хөдөлгөөний тайлан ({year})</h3>
          <table className="w-full text-xs">
            <thead><tr className="bg-nebo-primary text-white">{['Код','Нэр','Нэгж','Эцсийн үлдэгдэл','Орлого','Зарлага','Борлуулалт'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
            <tbody>{movementReport.map(r => (
              <tr key={r.code} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{r.code}</td><td className="px-3 py-2">{r.name}</td><td className="px-3 py-2">{r.unit}</td>
                <td className="px-3 py-2 text-right">{r.current_qty}</td><td className="px-3 py-2 text-right">{r.income_qty}</td>
                <td className="px-3 py-2 text-right">{r.expense_qty}</td><td className="px-3 py-2 text-right">{r.sales_qty}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="mt-4 text-right"><PrintButton /></div>
      </div>
    </>
  );
}
