import Header from '@/components/Header';
import Alert from '@/components/Alert';
import ItemsGrid from '@/components/ItemsGrid';
import { getDbConfig, requireUser } from '@/lib/auth';
import { dbAll } from '@/lib/db';

export default async function ItemsPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const config = await getDbConfig();
  const { msg } = await searchParams;
  const items = await dbAll<{ id: number; code: string; name: string; unit: string; initial_qty: number; current_qty: number }>(
    config, 'SELECT id, code, name, unit, initial_qty, current_qty FROM bm_items WHERE org_id = ? ORDER BY code', [user.org_id]
  );

  return (
    <>
      <Header user={user} activeMenu="bm" dbConnection={config?.label} />
      <div className="page-wrap">
        <div className="mb-4 sm:mb-5">
          <h2 className="page-title">БМ нэр, эхний үлдэгдэл бүртгэл</h2>
          <p className="page-subtitle">Эхний үлдэгдэл оруулна. Эцсийн үлдэгдэл = эхний + орлого − зарлага − борлуулалт</p>
        </div>
        <Alert message={msg} />
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
          <ItemsGrid rows={items} />
        </div>
      </div>
    </>
  );
}
