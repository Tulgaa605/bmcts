import Header from '@/components/Header';
import Alert from '@/components/Alert';
import IncomeGrid from '@/components/IncomeGrid';
import IncomeModal from '@/components/IncomeModal';
import { getDbConfig, requireUser, today } from '@/lib/auth';
import { dbAll, nextDocNo } from '@/lib/db';

export default async function IncomePage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const config = await getDbConfig();
  const { msg } = await searchParams;
  const records = await dbAll<{ id: number; doc_no: string; doc_date: string; item_code: string; item_name: string; unit: string; qty: number; price: number; total: number; supplier: string }>(config, `
    SELECT i.*, b.code as item_code, b.name as item_name, b.unit
    FROM bm_income i JOIN bm_items b ON i.item_id = b.id
    WHERE i.org_id = ? ORDER BY i.doc_date DESC, i.id DESC`, [user.org_id]);
  const items = await dbAll<{ id: number; code: string; name: string; unit: string }>(
    config,
    'SELECT id, code, name, unit FROM bm_items WHERE org_id = ? ORDER BY code',
    [user.org_id]
  );
  const docNo = await nextDocNo(config, 'ORL', user.org_id);

  return (
    <>
      <Header user={user} activeMenu="bm" dbConnection={config?.label} />
      <div className="page-wrap">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="page-title">БМ орлогын бүртгэл</h2>
            <p className="page-subtitle">Гараар, Excel-ээс, эсвэл нөгөө байгууллагын зарлагаас орлогоор орно</p>
          </div>
          <div className="self-end sm:self-auto">
            <IncomeModal docNo={docNo} today={today()} items={items} />
          </div>
        </div>
        <Alert message={msg} />

        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
          <IncomeGrid rows={records} />
        </div>
      </div>
    </>
  );
}
