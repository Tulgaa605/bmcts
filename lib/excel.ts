export function normalizeHeader(h: string): string {
  return String(h).trim().toLowerCase();
}

export function mapRow<T extends Record<string, unknown>>(
  row: Record<string, unknown>,
  fieldMap: Record<string, readonly string[]>
): Partial<T> {
  const normalized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    normalized[normalizeHeader(key)] = val;
  }

  const result: Record<string, unknown> = {};
  for (const [field, aliases] of Object.entries(fieldMap)) {
    for (const alias of aliases) {
      const v = normalized[normalizeHeader(alias)];
      if (v !== undefined && v !== null && v !== '') {
        result[field] = v;
        break;
      }
    }
  }
  return result as Partial<T>;
}

export const ITEM_FIELD_MAP = {
  code: ['код', 'code'],
  name: ['нэр', 'name'],
  unit: ['нэгж', 'unit'],
  initial_qty: ['эхний үлдэгдэл', 'initial_qty', 'үлдэгдэл'],
  initial_price: ['эхний үнэ', 'initial_price', 'үнэ'],
} as const;

export const INCOME_FIELD_MAP = {
  doc_date: ['огноо', 'doc_date', 'date'],
  item_code: ['код', 'item_code', 'барааны код'],
  qty: ['тоо', 'тоо хэмжээ', 'qty', 'quantity'],
  price: ['үнэ', 'price'],
  supplier: ['нийлүүлэгч', 'supplier'],
  note: ['тайлбар', 'note'],
} as const;
