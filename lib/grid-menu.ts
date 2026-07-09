import type { GridApi } from 'ag-grid-community';
import * as XLSX from 'xlsx';
import type { ContextMenuItem } from '@/components/GridContextMenu';

export type ExportColumn = { field: string; header: string };

function downloadSheet(filename: string, rows: unknown[][], sheetName = 'Data') {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export function exportGridToExcel(api: GridApi, columns: ExportColumn[], filename: string) {
  const headerRow = columns.map((c) => c.header);
  const dataRows: unknown[][] = [];

  api.forEachNodeAfterFilterAndSort((node) => {
    if (!node.data) return;
    const record = node.data as Record<string, unknown>;
    dataRows.push(columns.map((c) => record[c.field] ?? ''));
  });

  downloadSheet(filename, [headerRow, ...dataRows]);
}

export function exportHeaderTemplate(headers: string[], filename: string) {
  downloadSheet(filename, [headers], 'Загвар');
}

async function copyGridToClipboard(api: GridApi, columns: ExportColumn[], withHeaders: boolean) {
  const lines: string[] = [];
  if (withHeaders) lines.push(columns.map((c) => c.header).join('\t'));

  api.forEachNodeAfterFilterAndSort((node) => {
    if (!node.data) return;
    const record = node.data as Record<string, unknown>;
    lines.push(columns.map((c) => String(record[c.field] ?? '')).join('\t'));
  });

  await navigator.clipboard.writeText(lines.join('\n'));
}

export function buildGridMenuItems(
  api: GridApi,
  columns: ExportColumn[],
  templateHeaders: string[],
  dataFilename: string,
  templateFilename: string
): ContextMenuItem[] {
  return [
    {
      type: 'item',
      label: 'Excel татах',
      onClick: () => exportGridToExcel(api, columns, dataFilename),
    },
    {
      type: 'item',
      label: 'Загвар татах (header)',
      onClick: () => exportHeaderTemplate(templateHeaders, templateFilename),
    },
    { type: 'separator' },
    {
      type: 'item',
      label: 'Багана эрэмбэлэх',
      onClick: () => api.resetColumnState(),
    },
    {
      type: 'item',
      label: 'Хуулах',
      onClick: () => void copyGridToClipboard(api, columns, false),
    },
    {
      type: 'item',
      label: 'Header-тай хуулах',
      onClick: () => void copyGridToClipboard(api, columns, true),
    },
  ];
}
