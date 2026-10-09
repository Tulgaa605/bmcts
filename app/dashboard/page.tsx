import Header from '@/components/Header';
import DashboardCharts from '@/components/DashboardCharts';
import { getDbConfig, requireUser } from '@/lib/auth';
import { dbAll, dbGet } from '@/lib/db';
import Link from 'next/link';

const shortcuts = [
  { href: '/bm/items', label: 'Бараа', desc: 'Нэр, эхний үлдэгдэл' },
  { href: '/bm/income', label: 'Орлого', desc: 'Гараар / Excel' },
  { href: '/bm/expense', label: 'Зарлага', desc: 'Хаашаа / буцаалт' },
  { href: '/bm/report', label: 'Тайлан', desc: 'Үлдэгдэл, хөдөлгөөн' },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const config = await getDbConfig();
  const year = new Date().getFullYear();
  const orgId = user.org_id;

  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);

  const incomes = await dbAll<{ doc_date: string; total: number }>(config, "SELECT doc_date, total FROM bm_income WHERE org_id = ? AND strftime('%Y', doc_date) = ?", [orgId, String(year)]);
  incomes.forEach((r) => { monthlyIncome[parseInt(r.doc_date.split('-')[1], 10) - 1] += r.total; });

  const expenses = await dbAll<{ doc_date: string; total: number }>(config, "SELECT doc_date, total FROM bm_expense WHERE org_id = ? AND COALESCE(is_return,0)=0 AND strftime('%Y', doc_date) = ?", [orgId, String(year)]);
  expenses.forEach((r) => { monthlyExpense[parseInt(r.doc_date.split('-')[1], 10) - 1] += r.total; });

  const itemCount = (await dbGet<{ c: number }>(config, 'SELECT COUNT(*) as c FROM bm_items WHERE org_id = ?', [orgId]))?.c || 0;
  const stockValue = (await dbGet<{ t: number }>(config, 'SELECT COALESCE(SUM(current_qty * initial_price),0) as t FROM bm_items WHERE org_id = ?', [orgId]))?.t || 0;

  return (
    <>
      <Header user={user} activeMenu="home" dbConnection={config?.label} />
      <div className="flex flex-col gap-2 border-b border-gray-200 bg-white px-3 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:text-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
          <span>Байгууллага: <strong>{user.org_name}</strong></span>
          <span className="hidden text-gray-300 sm:inline">|</span>
          <span>Тайлант он: <strong>{year}</strong></span>
          {config && (
            <>
              <span className="hidden text-gray-300 sm:inline">|</span>
              <span className="truncate">Бааз: <strong className="font-mono text-nebo-primary">{config.label}</strong></span>
            </>
          )}
        </div>
        <span className="sm:hidden">Хэрэглэгч: <strong>{user.full_name}</strong></span>
      </div>

      <div className="page-wrap pb-2">
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {shortcuts.map((s) => (
            <Link key={s.href} href={s.href} className="card transition hover:border-nebo-primary/40 hover:shadow-md">
              <div className="text-sm font-bold text-nebo-dark">{s.label}</div>
              <div className="mt-1 text-xs text-gray-500">{s.desc}</div>
            </Link>
          ))}
        </div>
        <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="card">
            <div className="text-xs text-gray-500">Барааны тоо</div>
            <div className="mt-1 text-2xl font-bold text-nebo-primary">{itemCount}</div>
          </div>
          <div className="card">
            <div className="text-xs text-gray-500">Үлдэгдлийн дүн</div>
            <div className="mt-1 text-2xl font-bold text-nebo-primary">{stockValue.toLocaleString()} ₮</div>
          </div>
        </div>
      </div>

      <DashboardCharts data={{ monthlyIncome, monthlyExpense }} />
    </>
  );
}
