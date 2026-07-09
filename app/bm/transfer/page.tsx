import Header from '@/components/Header';
import Alert from '@/components/Alert';
import DeleteButton from '@/components/DeleteButton';
import { getDbConfig, requireUser, today } from '@/lib/auth';
import { dbAll, nextDocNo } from '@/lib/db';
import { createTransferAction, deleteTransferAction } from '@/actions/bm';

export default async function TransferPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const config = await getDbConfig();
  const { msg } = await searchParams;
  const records = await dbAll<{ id: number; doc_no: string; doc_date: string; item_code: string; item_name: string; unit: string; qty: number; from_keeper: string; to_keeper: string; note: string }>(config, `
    SELECT t.*, b.code as item_code, b.name as item_name, b.unit FROM bm_transfers t JOIN bm_items b ON t.item_id = b.id
    WHERE t.org_id = ? ORDER BY t.doc_date DESC, t.id DESC`, [user.org_id]);
  const items = await dbAll<{ id: number; code: string; name: string; unit: string }>(config, 'SELECT id, code, name, unit FROM bm_items WHERE org_id = ? ORDER BY code', [user.org_id]);
  const docNo = await nextDocNo(config, 'SHL', user.org_id);

  return (
    <>
      <Header user={user} activeMenu="bm" dbConnection={config?.label} />
      <div className="page-wrap">
        <h2 className="mb-4 text-lg font-bold text-nebo-primary">БМ Нярав хоорондох шилжүүлэг</h2>
        <Alert message={msg} />
        <div className="card mb-4">
          <h3 className="mb-3 border-b pb-2 text-sm font-semibold">Шилжүүлэг бүртгэх</h3>
          <form action={createTransferAction} className="flex flex-wrap items-end gap-3">
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Баримтын дугаар</label><input name="doc_no" defaultValue={docNo} readOnly className="input-field w-36 bg-gray-50" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Огноо</label><input name="doc_date" type="date" defaultValue={today()} required className="input-field w-36" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Бараа</label>
              <select name="item_id" required className="input-field w-48"><option value="">Сонгох...</option>{items.map(i => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}</select>
            </div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Тоо хэмжээ</label><input name="qty" type="number" step="0.01" required className="input-field w-28" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Хаанаас</label><input name="from_keeper" required className="input-field w-32" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Хаашаа</label><input name="to_keeper" required className="input-field w-32" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Тайлбар</label><input name="note" className="input-field w-36" /></div>
            <button type="submit" className="btn-primary">Бүртгэх</button>
          </form>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-nebo-primary text-white">{['Дугаар','Огноо','Код','Бараа','Тоо','Нэгж','Хаанаас','Хаашаа','Тайлбар','Үйлдэл'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
            <tbody>{records.map(r => (
              <tr key={r.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{r.doc_no}</td><td className="px-3 py-2">{r.doc_date}</td><td className="px-3 py-2">{r.item_code}</td><td className="px-3 py-2">{r.item_name}</td>
                <td className="px-3 py-2 text-right">{r.qty}</td><td className="px-3 py-2">{r.unit}</td><td className="px-3 py-2">{r.from_keeper}</td><td className="px-3 py-2">{r.to_keeper}</td>
                <td className="px-3 py-2">{r.note || ''}</td><td className="px-3 py-2"><DeleteButton action={deleteTransferAction} id={r.id} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
