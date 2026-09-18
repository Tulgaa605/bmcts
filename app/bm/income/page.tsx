import Header from '@/components/Header';
import Alert from '@/components/Alert';
import IncomeGrid from '@/components/IncomeGrid';
import CalcTotalForm from '@/components/CalcTotalForm';
import { getDbConfig, requireUser, today } from '@/lib/auth';
import { dbAll, nextDocNo } from '@/lib/db';
import { createIncomeAction } from '@/actions/bm';

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
        <div className="mb-4 sm:mb-5">
          <h2 className="page-title">БМ орлогын бүртгэл</h2>
          <p className="page-subtitle">Гараар эсвэл Excel-ээс орлого бүртгэнэ</p>
        </div>
        <Alert message={msg} />

        <div className="card mb-4">
          <h3 className="mb-3 border-b pb-2 text-sm font-semibold">Орлого гараар бүртгэх</h3>
          <CalcTotalForm action={createIncomeAction}>
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Баримтын дугаар</label>
                <input name="doc_no" defaultValue={docNo} readOnly className="input-field w-36 bg-gray-50" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Огноо</label>
                <input name="doc_date" type="date" defaultValue={today()} required className="input-field w-36" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Бараа</label>
                <select name="item_id" required className="input-field w-56">
                  <option value="">Сонгох...</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.code} - {i.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Тоо хэмжээ</label>
                <input name="qty" type="number" step="0.01" min="0.01" required className="input-field w-28" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Үнэ</label>
                <input name="price" type="number" step="0.01" min="0" required className="input-field w-28" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Нийлүүлэгч</label>
                <input name="supplier" className="input-field w-36" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Тайлбар</label>
                <input name="note" className="input-field w-36" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary">Бүртгэх</button>
              </div>
            </div>
          </CalcTotalForm>
          {items.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">Эхлээд «БМ нэр, эхний үлдэгдэл бүртгэл» дээр бараа нэмнэ үү.</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
          <IncomeGrid rows={records} />
        </div>
      </div>
    </>
  );
}
