import { updateItemAction, deleteItemAction } from '@/actions/bm';
import DeleteButton from '@/components/DeleteButton';

export default function ItemEditRow({ item }: { item: { id: number; code: string; name: string; unit: string; initial_qty: number; initial_price: number; current_qty: number } }) {
  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="px-3 py-2">{item.code}</td>
      <td className="px-3 py-2" colSpan={4}>
        <form action={updateItemAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={item.id} />
          <input name="name" defaultValue={item.name} className="input-field w-40" />
          <input name="unit" defaultValue={item.unit} className="input-field w-16" />
          <input name="initial_qty" type="number" step="0.01" defaultValue={item.initial_qty} className="input-field w-20" />
          <input name="initial_price" type="number" step="0.01" defaultValue={item.initial_price} className="input-field w-24" />
          <button type="submit" className="btn-warning">Засах</button>
        </form>
      </td>
      <td className="px-3 py-2 text-right font-bold">{item.current_qty}</td>
      <td className="px-3 py-2"><DeleteButton action={deleteItemAction} id={item.id} /></td>
    </tr>
  );
}
