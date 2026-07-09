import Header from '@/components/Header';
import Alert from '@/components/Alert';
import DeleteButton from '@/components/DeleteButton';
import CalcTotalForm from '@/components/CalcTotalForm';
import { getDbConfig, requireUser, today } from '@/lib/auth';
import { dbAll, nextDocNo } from '@/lib/db';
import { createSalesAction, deleteSalesAction } from '@/actions/bm';

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const config = await getDbConfig();
  const { msg } = await searchParams;
  const records = await dbAll<{ id: number; doc_no: string; doc_date: string; item_code: string; item_name: string; unit: string; qty: number; price: number; total: number; customer: string }>(config, `
    SELECT s.*, b.code as item_code, b.name as item_name, b.unit FROM bm_sales s JOIN bm_items b ON s.item_id = b.id
    WHERE s.org_id = ? ORDER BY s.doc_date DESC, s.id DESC`, [user.org_id]);
  const items = await dbAll<{ id: number; code: string; name: string; unit: string; current_qty: number }>(config, 'SELECT id, code, name, unit, current_qty FROM bm_items WHERE org_id = ? ORDER BY code', [user.org_id]);
  const docNo = await nextDocNo(config, 'BOR', user.org_id);

  return (
    <>
      <Header user={user} activeMenu="bm" dbConnection={config?.label} />
      <div className="page-wrap">
        <h2 className="mb-4 text-lg font-bold text-nebo-primary">БМ борлуулалтын бүртгэл</h2>
        <Alert message={msg} />
        <div className="card mb-4">
          <h3 className="mb-3 border-b pb-2 text-sm font-semibold">Борлуулалт бүртгэх</h3>
          <CalcTotalForm action={createSalesAction}>
            <div className="flex flex-wrap gap-3">
              <div><label className="mb-1 block text-xs font-semibold text-gray-500">Баримтын дугаар</label><input name="doc_no" defaultValue={docNo} readOnly className="input-field w-36 bg-gray-50" /></div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-500">Огноо</label><input name="doc_date" type="date" defaultValue={today()} required className="input-field w-36" /></div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-500">Бараа</label>
                <select name="item_id" required className="input-field w-56"><option value="">Сонгох...</option>{items.map(i => <option key={i.id} value={i.id}>{i.code} - {i.name} (үлд: {i.current_qty})</option>)}</select>
              </div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-500">Тоо хэмжээ</label><input name="qty" type="number" step="0.01" required className="input-field w-28" /></div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-500">Үнэ</label><input name="price" type="number" step="0.01" required className="input-field w-28" /></div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-500">Худалдан авагч</label><input name="customer" className="input-field w-36" /></div>
              <div><label className="mb-1 block text-xs font-semibold text-gray-500">Тайлбар</label><input name="note" className="input-field w-36" /></div>
              <div className="flex items-end"><button type="submit" className="btn-primary">Бүртгэх</button></div>
            </div>
          </CalcTotalForm>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-nebo-primary text-white">{['Дугаар','Огноо','Код','Бараа','Тоо','Нэгж','Үнэ','Нийт','Худалдан авагч','Үйлдэл'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
            <tbody>{records.map(r => (
              <tr key={r.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{r.doc_no}</td><td className="px-3 py-2">{r.doc_date}</td><td className="px-3 py-2">{r.item_code}</td><td className="px-3 py-2">{r.item_name}</td>
                <td className="px-3 py-2 text-right">{r.qty}</td><td className="px-3 py-2">{r.unit}</td><td className="px-3 py-2 text-right">{r.price.toLocaleString()}</td><td className="px-3 py-2 text-right">{r.total.toLocaleString()}</td>
                <td className="px-3 py-2">{r.customer || ''}</td><td className="px-3 py-2"><DeleteButton action={deleteSalesAction} id={r.id} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
