import Header from '@/components/Header';
import Alert from '@/components/Alert';
import ExpenseModal from '@/components/ExpenseModal';
import ExpenseHistory from '@/components/ExpenseHistory';
import { getDbConfig, requireUser } from '@/lib/auth';
import { dbAll, nextDocNo } from '@/lib/db';

export default async function ExpensePage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const config = await getDbConfig();
  const { msg } = await searchParams;
  const records = await dbAll<{ id: number; doc_no: string; doc_date: string; item_code: string; item_name: string; unit: string; qty: number; price: number; total: number; purpose: string; is_return: number | null }>(config, `
    SELECT e.*, b.code as item_code, b.name as item_name, b.unit FROM bm_expense e JOIN bm_items b ON e.item_id = b.id
    WHERE e.org_id = ? ORDER BY e.doc_date DESC, e.id DESC`, [user.org_id]);
  const items = await dbAll<{ id: number; code: string; name: string; unit: string; initial_qty: number; current_qty: number; price: number }>(config, 'SELECT id, code, name, unit, initial_qty, current_qty, initial_price as price FROM bm_items WHERE org_id = ? ORDER BY code', [user.org_id]);
  const orgs = await dbAll<{ id: number; name: string }>(config, 'SELECT id, name FROM organizations WHERE id != ? ORDER BY name', [user.org_id]);
  const destinations = await dbAll<{ id: number; kind: string; name: string }>(config, 'SELECT id, kind, name FROM bm_destinations ORDER BY kind, name');
  const docNo = await nextDocNo(config, 'ZAR', user.org_id);

  return (
    <>
      <Header user={user} activeMenu="bm" dbConnection={config?.label} />
      <div className="page-wrap">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="page-title">Бараа материалын зарлага</h2>
            <p className="page-subtitle">Хаашаа сонгоод шилжүүлнэ. Үлдэгдэл буцаахад орлого биш, эцсийн үлдэгдэл нэмэгдэнэ</p>
          </div>
          <div className="self-end sm:self-auto">
            <ExpenseModal docNo={docNo} items={items} orgs={orgs} destinations={destinations} />
          </div>
        </div>

        <Alert message={msg} />

        {items.length === 0 && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Эхлээд «БМ нэр, эхний үлдэгдэл бүртгэл» дээр бараа нэмнэ үү.
          </p>
        )}

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

        <ExpenseHistory records={records} />
      </div>
    </>
  );
}
