import Header from '@/components/Header';
import DashboardCharts from '@/components/DashboardCharts';
import { getDbConfig, requireUser } from '@/lib/auth';
import { dbAll } from '@/lib/db';

export default async function DashboardPage() {
  const user = await requireUser();
  const config = await getDbConfig();
  const year = new Date().getFullYear();
  const orgId = user.org_id;

  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);
  const monthlySales = Array(12).fill(0);

  const incomes = await dbAll<{ doc_date: string; total: number }>(config, "SELECT doc_date, total FROM bm_income WHERE org_id = ? AND strftime('%Y', doc_date) = ?", [orgId, String(year)]);
  incomes.forEach((r) => { monthlyIncome[parseInt(r.doc_date.split('-')[1], 10) - 1] += r.total; });

  const expenses = await dbAll<{ doc_date: string; total: number }>(config, "SELECT doc_date, total FROM bm_expense WHERE org_id = ? AND strftime('%Y', doc_date) = ?", [orgId, String(year)]);
  expenses.forEach((r) => { monthlyExpense[parseInt(r.doc_date.split('-')[1], 10) - 1] += r.total; });

  const sales = await dbAll<{ doc_date: string; total: number }>(config, "SELECT doc_date, total FROM bm_sales WHERE org_id = ? AND strftime('%Y', doc_date) = ?", [orgId, String(year)]);
  sales.forEach((r) => { monthlySales[parseInt(r.doc_date.split('-')[1], 10) - 1] += r.total; });

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
      <DashboardCharts data={{ monthlyIncome, monthlyExpense, monthlySales }} />
    </>
  );
}
