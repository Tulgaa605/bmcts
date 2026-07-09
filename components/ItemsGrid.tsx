'use client';

import { useCallback, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, CellContextMenuEvent, ColDef, GridApi, ModuleRegistry } from 'ag-grid-community';
import * as XLSX from 'xlsx';
import { deleteItemAction, importItemsAction, ItemImportRow } from '@/actions/bm';
import GridDeleteCell from '@/components/GridDeleteCell';
import GridContextMenu from '@/components/GridContextMenu';
import { ITEM_FIELD_MAP, mapRow } from '@/lib/excel';
import { buildGridMenuItems } from '@/lib/grid-menu';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);

type ItemRow = {
  id: number;
  code: string;
  name: string;
  unit: string;
  initial_qty: number;
};

export default function ItemsGrid({ rows }: { rows: ItemRow[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const [status, setStatus] = useState('');
  const [pending, startTransition] = useTransition();
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const exportColumns = useMemo(
    () => [
      { field: 'code', header: 'Код' },
      { field: 'name', header: 'Нэр' },
      { field: 'unit', header: 'Нэгж' },
      { field: 'initial_qty', header: 'Эхний үлдэгдэл' },
    ],
    []
  );

  const columnDefs = useMemo<ColDef<ItemRow>[]>(
    () => [
      { field: 'code', headerName: 'Код', flex: 1, minWidth: 120, filter: true },
      { field: 'name', headerName: 'Нэр', flex: 1, minWidth: 120, filter: true },
      { field: 'unit', headerName: 'Нэгж', flex: 1, minWidth: 120 },
      { field: 'initial_qty', headerName: 'Эхний үлдэгдэл', flex: 1, minWidth: 120, type: 'numericColumn' },
      {
        headerName: 'Үйлдэл',
        width: 100,
        sortable: false,
        filter: false,
        suppressMovable: true,
        cellRenderer: (p: { data?: ItemRow }) =>
          p.data ? <GridDeleteCell id={p.data.id} action={deleteItemAction} /> : null,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true, suppressMovable: false }), []);

  const onCellContextMenu = useCallback((e: CellContextMenuEvent) => {
    e.event?.preventDefault();
    const ev = e.event as MouseEvent | undefined;
    if (!ev) return;
    setMenuPos({ x: ev.clientX, y: ev.clientY });
  }, []);

  const onImport = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

      const parsed: ItemImportRow[] = raw
        .map((row) => mapRow<ItemImportRow>(row, ITEM_FIELD_MAP))
        .filter((r) => r.code && r.name)
        .map((r) => ({
          code: String(r.code).trim(),
          name: String(r.name).trim(),
          unit: r.unit ? String(r.unit).trim() : 'ш',
          initial_qty: Number(r.initial_qty) || 0,
          initial_price: Number(r.initial_price) || 0,
        }));

      if (parsed.length === 0) {
        setStatus('Excel файлд зөв мөр олдсонгүй');
        return;
      }

      startTransition(async () => {
        const result = await importItemsAction(parsed);
        const errMsg = result.errors.length ? ` | Алдаа: ${result.errors.slice(0, 3).join(', ')}` : '';
        setStatus(`${result.count} бараа амжилттай татагдлаа${errMsg}`);
        router.refresh();
      });
    },
    [router]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-lg bg-nebo-primary px-4 py-2 text-sm font-semibold text-white hover:bg-nebo-dark disabled:opacity-50 sm:w-auto"
        >
          {pending ? 'Татаж байна...' : 'Excel-ээс татах'}
        </button>
        <span className="text-xs text-gray-500">
          Багана: Код, Нэр, Нэгж, Эхний үлдэгдэл
        </span>
        {status && <span className="text-sm text-nebo-primary">{status}</span>}
      </div>

      <div
        className="ag-theme-quartz overflow-hidden rounded-xl border border-gray-200"
        style={{ height: 'min(520px, calc(100dvh - 260px))', minHeight: 360, width: '100%' }}
      >
        <AgGridReact<ItemRow>
          theme="legacy"
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={(p) => { gridApiRef.current = p.api; }}
          onCellContextMenu={onCellContextMenu}
          preventDefaultOnContextMenu
          suppressMovableColumns={false}
          animateRows
          pagination
          paginationPageSize={20}
          suppressCellFocus
        />
      </div>
      {menuPos && gridApiRef.current && (
        <GridContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={buildGridMenuItems(
            gridApiRef.current,
            exportColumns,
            ['Код', 'Нэр', 'Нэгж', 'Эхний үлдэгдэл'],
            'bm-items.xlsx',
            'bm-items-template.xlsx'
          )}
          onClose={() => setMenuPos(null)}
        />
      )}
    </div>
  );
}
