'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { dbAll, dbGet, dbRun, updateItemQty, nextDocNo } from '@/lib/db';
import { getDbConfig, requireUser } from '@/lib/auth';
import { useFirebird } from '@/lib/connection';

function redirectWithMsg(path: string, msg: string) {
  redirect(`${path}?msg=${encodeURIComponent(msg)}`);
}

export type ItemImportRow = {
  code: string;
  name: string;
  unit?: string;
  initial_qty?: number;
  initial_price?: number;
};

export type IncomeImportRow = {
  doc_date?: string;
  item_code: string;
  qty: number;
  price: number;
  supplier?: string;
  note?: string;
};

export async function importItemsAction(rows: ItemImportRow[]) {
  const user = await requireUser();
  const config = await getDbConfig();
  let count = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const code = String(row.code || '').trim();
    const name = String(row.name || '').trim();
    if (!code || !name) {
      errors.push('Код эсвэл нэр хоосон мөр алгасав');
      continue;
    }
    try {
      const unit = String(row.unit || 'ш').trim() || 'ш';
      const initial_qty = Number(row.initial_qty) || 0;
      const initial_price = Number(row.initial_price) || 0;
      await dbRun(
        config,
        'INSERT INTO bm_items (org_id, code, name, unit, initial_qty, initial_price, current_qty) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.org_id, code, name, unit, initial_qty, initial_price, initial_qty]
      );
      count++;
    } catch {
      errors.push(`${code}: Код давхардаж байна`);
    }
  }

  revalidatePath('/bm/items');
  return { ok: true, count, errors };
}

export async function importIncomeAction(rows: IncomeImportRow[]) {
  const user = await requireUser();
  const config = await getDbConfig();
  let count = 0;
  const errors: string[] = [];
  const today = new Date().toISOString().split('T')[0];

  for (const row of rows) {
    const item_code = String(row.item_code || '').trim();
    if (!item_code) {
      errors.push('Барааны код хоосон мөр алгасав');
      continue;
    }

    const item = await dbGet<{ id: number }>(
      config,
      'SELECT id FROM bm_items WHERE org_id = ? AND code = ?',
      [user.org_id, item_code]
    );
    if (!item) {
      errors.push(`${item_code}: Бараа олдсонгүй`);
      continue;
    }

    const qty = Number(row.qty);
    const price = Number(row.price);
    if (!qty || qty <= 0) {
      errors.push(`${item_code}: Тоо хэмжээ буруу`);
      continue;
    }
    if (price < 0 || Number.isNaN(price)) {
      errors.push(`${item_code}: Үнэ буруу`);
      continue;
    }

    const docNo = await nextDocNo(config, 'ORL', user.org_id);
    const doc_date = String(row.doc_date || today).trim() || today;

    await dbRun(
      config,
      'INSERT INTO bm_income (org_id, doc_no, doc_date, item_id, qty, price, total, supplier, note, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [user.org_id, docNo, doc_date, item.id, qty, price, qty * price, row.supplier || '', row.note || '', user.id]
    );
    await updateItemQty(config, item.id);
    count++;
  }

  revalidatePath('/bm/income');
  return { ok: true, count, errors };
}

export async function createItemAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const unit = (formData.get('unit') as string) || 'ш';
  const initial_qty = parseFloat(formData.get('initial_qty') as string) || 0;
  const initial_price = parseFloat(formData.get('initial_price') as string) || 0;

  try {
    await dbRun(config, 'INSERT INTO bm_items (org_id, code, name, unit, initial_qty, initial_price, current_qty) VALUES (?, ?, ?, ?, ?, ?, ?)', [user.org_id, code, name, unit, initial_qty, initial_price, initial_qty]);
    revalidatePath('/bm/items');
    redirectWithMsg('/bm/items', 'Амжилттай нэмэгдлээ');
  } catch {
    redirectWithMsg('/bm/items', 'Алдаа: Код давхардаж байна');
  }
}

export async function updateItemAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const id = parseInt(formData.get('id') as string);
  await dbRun(config, 'UPDATE bm_items SET name=?, unit=?, initial_qty=?, initial_price=? WHERE id=? AND org_id=?', [formData.get('name'), formData.get('unit'), parseFloat(formData.get('initial_qty') as string), parseFloat(formData.get('initial_price') as string), id, user.org_id]);
  await updateItemQty(config, id);
  revalidatePath('/bm/items');
  redirectWithMsg('/bm/items', 'Амжилттай засагдлаа');
}

export async function deleteItemAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  try {
    await dbRun(config, 'DELETE FROM bm_items WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
    redirectWithMsg('/bm/items', 'Устгагдлаа');
  } catch {
    redirectWithMsg('/bm/items', 'Устгах боломжгүй - холбоотой бичлэг байна');
  }
}

export async function createIncomeAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const item_id = parseInt(formData.get('item_id') as string);
  const qty = parseFloat(formData.get('qty') as string);
  const price = parseFloat(formData.get('price') as string);
  await dbRun(config, 'INSERT INTO bm_income (org_id, doc_no, doc_date, item_id, qty, price, total, supplier, note, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)', [user.org_id, formData.get('doc_no'), formData.get('doc_date'), item_id, qty, price, qty * price, formData.get('supplier'), formData.get('note'), user.id]);
  await updateItemQty(config, item_id);
  revalidatePath('/bm/income');
  redirectWithMsg('/bm/income', 'Орлого бүртгэгдлээ');
}

export async function deleteIncomeAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const rec = await dbGet<{ item_id: number }>(config, 'SELECT item_id FROM bm_income WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
  if (rec) {
    await dbRun(config, 'DELETE FROM bm_income WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
    await updateItemQty(config, rec.item_id);
  }
  revalidatePath('/bm/income');
  redirectWithMsg('/bm/income', 'Устгагдлаа');
}

export async function createExpenseAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const item_id = parseInt(formData.get('item_id') as string);
  const qty = parseFloat(formData.get('qty') as string);
  const price = parseFloat(formData.get('price') as string);
  const item = await dbGet<{ current_qty: number }>(config, 'SELECT current_qty FROM bm_items WHERE id = ? AND org_id = ?', [item_id, user.org_id]);
  if (!item || item.current_qty < qty) return redirectWithMsg('/bm/expense', 'Үлдэгдэл хүрэлцэхгүй байна');
  await dbRun(config, 'INSERT INTO bm_expense (org_id, doc_no, doc_date, item_id, qty, price, total, purpose, note, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)', [user.org_id, formData.get('doc_no'), formData.get('doc_date'), item_id, qty, price, qty * price, formData.get('purpose'), formData.get('note'), user.id]);
  await updateItemQty(config, item_id);
  revalidatePath('/bm/expense');
  redirectWithMsg('/bm/expense', 'Зарлага бүртгэгдлээ');
}

export async function deleteExpenseAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const rec = await dbGet<{ item_id: number }>(config, 'SELECT item_id FROM bm_expense WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
  if (rec) {
    await dbRun(config, 'DELETE FROM bm_expense WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
    await updateItemQty(config, rec.item_id);
  }
  revalidatePath('/bm/expense');
  redirectWithMsg('/bm/expense', 'Устгагдлаа');
}

export async function createSalesAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const item_id = parseInt(formData.get('item_id') as string);
  const qty = parseFloat(formData.get('qty') as string);
  const price = parseFloat(formData.get('price') as string);
  const item = await dbGet<{ current_qty: number }>(config, 'SELECT current_qty FROM bm_items WHERE id = ? AND org_id = ?', [item_id, user.org_id]);
  if (!item || item.current_qty < qty) redirectWithMsg('/bm/sales', 'Үлдэгдэл хүрэлцэхгүй байна');
  await dbRun(config, 'INSERT INTO bm_sales (org_id, doc_no, doc_date, item_id, qty, price, total, customer, note, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)', [user.org_id, formData.get('doc_no'), formData.get('doc_date'), item_id, qty, price, qty * price, formData.get('customer'), formData.get('note'), user.id]);
  await updateItemQty(config, item_id);
  revalidatePath('/bm/sales');
  redirectWithMsg('/bm/sales', 'Борлуулалт бүртгэгдлээ');
}

export async function deleteSalesAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const rec = await dbGet<{ item_id: number }>(config, 'SELECT item_id FROM bm_sales WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
  if (rec) {
    await dbRun(config, 'DELETE FROM bm_sales WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
    await updateItemQty(config, rec.item_id);
  }
  revalidatePath('/bm/sales');
  redirectWithMsg('/bm/sales', 'Устгагдлаа');
}

export async function createTransferAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  await dbRun(config, 'INSERT INTO bm_transfers (org_id, doc_no, doc_date, item_id, qty, from_keeper, to_keeper, note, created_by) VALUES (?,?,?,?,?,?,?,?,?)', [user.org_id, formData.get('doc_no'), formData.get('doc_date'), formData.get('item_id'), parseFloat(formData.get('qty') as string), formData.get('from_keeper'), formData.get('to_keeper'), formData.get('note'), user.id]);
  revalidatePath('/bm/transfer');
  redirectWithMsg('/bm/transfer', 'Шилжүүлэг бүртгэгдлээ');
}

export async function deleteTransferAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  await dbRun(config, 'DELETE FROM bm_transfers WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
  revalidatePath('/bm/transfer');
  redirectWithMsg('/bm/transfer', 'Устгагдлаа');
}

export async function createInventoryAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const item_id = parseInt(formData.get('item_id') as string);
  const item = await dbGet<{ current_qty: number }>(config, 'SELECT current_qty FROM bm_items WHERE id = ? AND org_id = ?', [item_id, user.org_id]);
  if (!item) return redirectWithMsg('/bm/inventory', 'Бараа олдсонгүй');
  const bookQty = item.current_qty;
  const actualQty = parseFloat(formData.get('actual_qty') as string);
  const diff = actualQty - bookQty;
  await dbRun(config, 'INSERT INTO bm_inventory (org_id, doc_no, doc_date, item_id, book_qty, actual_qty, diff_qty, note, created_by) VALUES (?,?,?,?,?,?,?,?,?)', [user.org_id, formData.get('doc_no'), formData.get('doc_date'), item_id, bookQty, actualQty, diff, formData.get('note'), user.id]);
  if (diff !== 0) await dbRun(config, 'UPDATE bm_items SET current_qty = ? WHERE id = ?', [actualQty, item_id]);
  revalidatePath('/bm/inventory');
  redirectWithMsg('/bm/inventory', 'Тооллого бүртгэгдлээ');
}

export async function deleteInventoryAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  await dbRun(config, 'DELETE FROM bm_inventory WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
  revalidatePath('/bm/inventory');
  redirectWithMsg('/bm/inventory', 'Устгагдлаа');
}

export async function createLoadingAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const item_id = parseInt(formData.get('item_id') as string);
  const qty = parseFloat(formData.get('qty') as string);
  const type = formData.get('type') as string;

  if (type === 'unload') {
    const item = await dbGet<{ current_qty: number }>(config, 'SELECT current_qty FROM bm_items WHERE id = ? AND org_id = ?', [item_id, user.org_id]);
    if (!item || item.current_qty < qty) redirectWithMsg('/bm/loading', 'Үлдэгдэл хүрэлцэхгүй байна');
  }

  if (useFirebird()) {
    await dbRun(config, 'INSERT INTO bm_loading (org_id, doc_no, doc_date, item_id, qty, load_type, vehicle, driver, note, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)', [user.org_id, formData.get('doc_no'), formData.get('doc_date'), item_id, qty, type, formData.get('vehicle'), formData.get('driver'), formData.get('note'), user.id]);
  } else {
    await dbRun(config, 'INSERT INTO bm_loading (org_id, doc_no, doc_date, item_id, qty, type, vehicle, driver, note, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)', [user.org_id, formData.get('doc_no'), formData.get('doc_date'), item_id, qty, type, formData.get('vehicle'), formData.get('driver'), formData.get('note'), user.id]);
  }

  await updateItemQty(config, item_id);
  revalidatePath('/bm/loading');
  redirectWithMsg('/bm/loading', 'Бүртгэгдлээ');
}

export async function deleteLoadingAction(formData: FormData) {
  const user = await requireUser();
  const config = await getDbConfig();
  const rec = await dbGet<{ item_id: number }>(config, 'SELECT item_id FROM bm_loading WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
  if (rec) {
    await dbRun(config, 'DELETE FROM bm_loading WHERE id = ? AND org_id = ?', [formData.get('id'), user.org_id]);
    await updateItemQty(config, rec.item_id);
  }
  revalidatePath('/bm/loading');
  redirectWithMsg('/bm/loading', 'Устгагдлаа');
}

export { nextDocNo };
