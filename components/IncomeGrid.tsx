'use client';

import { useCallback, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, CellContextMenuEvent, ColDef, GridApi, ModuleRegistry } from 'ag-grid-community';
import * as XLSX from 'xlsx';
import { deleteIncomeAction, importIncomeAction, IncomeImportRow } from '@/actions/bm';
import GridDeleteCell from '@/components/GridDeleteCell';
import GridContextMenu from '@/components/GridContextMenu';
import { INCOME_FIELD_MAP, mapRow } from '@/lib/excel';
import { buildGridMenuItems } from '@/lib/grid-menu';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);

type IncomeRow = {
  id: number;
  doc_no: string;
  doc_date: string;
  item_code: string;
  item_name: string;
  unit: string;
  qty: number;
  price: number;
  total: number;
  supplier: string;
};

export default function IncomeGrid({ rows }: { rows: IncomeRow[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const [status, setStatus] = useState('');
  const [pending, startTransition] = useTransition();
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const exportColumns = useMemo(
    () => [
      { field: 'doc_no', header: 'Дугаар' },
      { field: 'doc_date', header: 'Огноо' },
      { field: 'item_code', header: 'Код' },
      { field: 'item_name', header: 'Бараа' },
      { field: 'qty', header: 'Тоо' },
      { field: 'unit', header: 'Нэгж' },
      { field: 'price', header: 'Үнэ' },
      { field: 'total', header: 'Нийт' },
      { field: 'supplier', header: 'Нийлүүлэгч' },
    ],
    []
  );

  const columnDefs = useMemo<ColDef<IncomeRow>[]>(
    () => [
      { field: 'doc_no', headerName: 'Дугаар', width: 130, filter: true },
      { field: 'doc_date', headerName: 'Огноо', width: 110 },
      { field: 'item_code', headerName: 'Код', width: 100, filter: true },
      { field: 'item_name', headerName: 'Бараа', flex: 1, minWidth: 160, filter: true },
      { field: 'qty', headerName: 'Тоо', width: 90, type: 'numericColumn' },
      { field: 'unit', headerName: 'Нэгж', width: 80 },
      {
        field: 'price',
        headerName: 'Үнэ',
        width: 110,
        type: 'numericColumn',
        valueFormatter: (p) => (p.value != null ? Number(p.value).toLocaleString() : ''),
      },
      {
        field: 'total',
        headerName: 'Нийт',
        width: 120,
        type: 'numericColumn',
        valueFormatter: (p) => (p.value != null ? Number(p.value).toLocaleString() : ''),
      },
      { field: 'supplier', headerName: 'Нийлүүлэгч', width: 140, filter: true },
      {
        headerName: 'Үйлдэл',
        width: 100,
        sortable: false,
        filter: false,
        suppressMovable: true,
        cellRenderer: (p: { data?: IncomeRow }) =>
          p.data ? <GridDeleteCell id={p.data.id} action={deleteIncomeAction} /> : null,
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

      const parsed: IncomeImportRow[] = raw
        .map((row) => mapRow<IncomeImportRow>(row, INCOME_FIELD_MAP))
        .filter((r) => r.item_code)
        .map((r) => ({
          doc_date: r.doc_date ? String(r.doc_date).trim() : undefined,
          item_code: String(r.item_code).trim(),
          qty: Number(r.qty),
          price: Number(r.price),
          supplier: r.supplier ? String(r.supplier).trim() : '',
          note: r.note ? String(r.note).trim() : '',
        }));

      if (parsed.length === 0) {
        setStatus('Excel файлд зөв мөр олдсонгүй');
        return;
      }

      startTransition(async () => {
        const result = await importIncomeAction(parsed);
        const errMsg = result.errors.length ? ` | Алдаа: ${result.errors.slice(0, 3).join(', ')}` : '';
        setStatus(`${result.count} орлого амжилттай татагдлаа${errMsg}`);
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
          Багана: Огноо, Код, Тоо, Үнэ, Нийлүүлэгч, Тайлбар
        </span>
        {status && <span className="text-sm text-nebo-primary">{status}</span>}
      </div>

      <div
        className="ag-theme-quartz overflow-hidden rounded-xl border border-gray-200"
        style={{ height: 'min(520px, calc(100dvh - 260px))', minHeight: 360, width: '100%' }}
      >
        <AgGridReact<IncomeRow>
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
            ['Огноо', 'Код', 'Тоо', 'Үнэ', 'Нийлүүлэгч', 'Тайлбар'],
            'bm-income.xlsx',
            'bm-income-template.xlsx'
          )}
          onClose={() => setMenuPos(null)}
        />
      )}
    </div>
  );
}
