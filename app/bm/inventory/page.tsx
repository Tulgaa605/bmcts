import Header from '@/components/Header';
import Alert from '@/components/Alert';
import DeleteButton from '@/components/DeleteButton';
import InventoryForm from '@/components/InventoryForm';
import { getDbConfig, requireUser } from '@/lib/auth';
import { dbAll, nextDocNo } from '@/lib/db';
import { deleteInventoryAction } from '@/actions/bm';

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const config = await getDbConfig();
  const { msg } = await searchParams;
  const records = await dbAll<{ id: number; doc_no: string; doc_date: string; item_code: string; item_name: string; book_qty: number; actual_qty: number; diff_qty: number; note: string }>(config, `
    SELECT inv.*, b.code as item_code, b.name as item_name FROM bm_inventory inv JOIN bm_items b ON inv.item_id = b.id
    WHERE inv.org_id = ? ORDER BY inv.doc_date DESC, inv.id DESC`, [user.org_id]);
  const items = await dbAll<{ id: number; code: string; name: string; unit: string; current_qty: number }>(config, 'SELECT id, code, name, unit, current_qty FROM bm_items WHERE org_id = ? ORDER BY code', [user.org_id]);
  const docNo = await nextDocNo(config, 'TOO', user.org_id);

  return (
    <>
      <Header user={user} activeMenu="bm" dbConnection={config?.label} />
      <div className="page-wrap">
        <h2 className="mb-4 text-lg font-bold text-nebo-primary">БМ тооллогын бүртгэл</h2>
        <Alert message={msg} />
        <div className="card mb-4">
          <h3 className="mb-3 border-b pb-2 text-sm font-semibold">Тооллого бүртгэх</h3>
          <InventoryForm docNo={docNo} items={items} />
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-nebo-primary text-white">{['Дугаар','Огноо','Код','Бараа','Номын','Бодит','Зөрүү','Тайлбар','Үйлдэл'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
            <tbody>{records.map(r => (
              <tr key={r.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{r.doc_no}</td><td className="px-3 py-2">{r.doc_date}</td><td className="px-3 py-2">{r.item_code}</td><td className="px-3 py-2">{r.item_name}</td>
                <td className="px-3 py-2 text-right">{r.book_qty}</td><td className="px-3 py-2 text-right">{r.actual_qty}</td>
                <td className={`px-3 py-2 text-right font-semibold ${r.diff_qty < 0 ? 'text-red-600' : r.diff_qty > 0 ? 'text-green-600' : ''}`}>{r.diff_qty}</td>
                <td className="px-3 py-2">{r.note || ''}</td><td className="px-3 py-2"><DeleteButton action={deleteInventoryAction} id={r.id} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
