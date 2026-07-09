import Header from '@/components/Header';
import Alert from '@/components/Alert';
import DeleteButton from '@/components/DeleteButton';
import { getDbConfig, requireUser, today } from '@/lib/auth';
import { dbAll, nextDocNo } from '@/lib/db';
import { useFirebird } from '@/lib/connection';
import { createLoadingAction, deleteLoadingAction } from '@/actions/bm';

export default async function LoadingPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const config = await getDbConfig();
  const { msg } = await searchParams;
  const typeCol = useFirebird() ? 'l.load_type as type' : 'l.type';
  const records = await dbAll<{ id: number; doc_no: string; doc_date: string; type: string; item_code: string; item_name: string; unit: string; qty: number; vehicle: string; driver: string }>(config, `
    SELECT l.id, l.doc_no, l.doc_date, l.qty, l.vehicle, l.driver, ${typeCol}, b.code as item_code, b.name as item_name, b.unit
    FROM bm_loading l JOIN bm_items b ON l.item_id = b.id
    WHERE l.org_id = ? ORDER BY l.doc_date DESC, l.id DESC`, [user.org_id]);
  const items = await dbAll<{ id: number; code: string; name: string; unit: string; current_qty: number }>(config, 'SELECT id, code, name, unit, current_qty FROM bm_items WHERE org_id = ? ORDER BY code', [user.org_id]);
  const docNo = await nextDocNo(config, 'ACH', user.org_id);

  return (
    <>
      <Header user={user} activeMenu="bm" dbConnection={config?.label} />
      <div className="page-wrap">
        <h2 className="mb-4 text-lg font-bold text-nebo-primary">БО ачилт, буулгалтын бүртгэл</h2>
        <Alert message={msg} />
        <div className="card mb-4">
          <h3 className="mb-3 border-b pb-2 text-sm font-semibold">Ачилт / Буулгалт бүртгэх</h3>
          <form action={createLoadingAction} className="flex flex-wrap items-end gap-3">
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Баримтын дугаар</label><input name="doc_no" defaultValue={docNo} readOnly className="input-field w-36 bg-gray-50" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Огноо</label><input name="doc_date" type="date" defaultValue={today()} required className="input-field w-36" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Төрөл</label>
              <select name="type" required className="input-field w-32"><option value="load">Ачилт</option><option value="unload">Буулгалт</option></select>
            </div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Бараа</label>
              <select name="item_id" required className="input-field w-56"><option value="">Сонгох...</option>{items.map(i => <option key={i.id} value={i.id}>{i.code} - {i.name} (үлд: {i.current_qty})</option>)}</select>
            </div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Тоо хэмжээ</label><input name="qty" type="number" step="0.01" required className="input-field w-28" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Машин</label><input name="vehicle" placeholder="УБ1234АА" className="input-field w-32" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Жолооч</label><input name="driver" className="input-field w-32" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-gray-500">Тайлбар</label><input name="note" className="input-field w-36" /></div>
            <button type="submit" className="btn-primary">Бүртгэх</button>
          </form>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-nebo-primary text-white">{['Дугаар','Огноо','Төрөл','Код','Бараа','Тоо','Нэгж','Машин','Жолооч','Үйлдэл'].map(h => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
            <tbody>{records.map(r => {
              const loadType = r.type || 'load';
              return (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2">{r.doc_no}</td><td className="px-3 py-2">{r.doc_date}</td>
                  <td className="px-3 py-2"><span className={`rounded px-2 py-0.5 text-xs font-semibold ${loadType === 'load' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{loadType === 'load' ? 'Ачилт' : 'Буулгалт'}</span></td>
                  <td className="px-3 py-2">{r.item_code}</td><td className="px-3 py-2">{r.item_name}</td>
                  <td className="px-3 py-2 text-right">{r.qty}</td><td className="px-3 py-2">{r.unit}</td>
                  <td className="px-3 py-2">{r.vehicle || ''}</td><td className="px-3 py-2">{r.driver || ''}</td>
                  <td className="px-3 py-2"><DeleteButton action={deleteLoadingAction} id={r.id} /></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
