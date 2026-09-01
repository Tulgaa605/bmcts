'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, getDbConfig } from '@/lib/auth';
import { dbAll, dbGet, dbRun, updateItemQty } from '@/lib/db';
import { CtsDetailItem, fetchAssetDetails, sendAssetAll, sendAssetItem } from '@/lib/cts';

function currentPeriod() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

async function upsertCtsItem(
  config: Awaited<ReturnType<typeof getDbConfig>>,
  orgId: number,
  code: string,
  detail: CtsDetailItem,
  initialQty?: number
) {
  const name = detail.name || code;
  const unit = detail.unt || 'ш';
  const price = Number(detail.une) || 0;
  const qty = initialQty != null && initialQty > 0 ? initialQty : detail.qty || 0;

  const existing = await dbGet<{ id: number }>(
    config,
    'SELECT id FROM bm_items WHERE org_id = ? AND code = ?',
    [orgId, code]
  );
  if (existing) {
    await dbRun(
      config,
      'UPDATE bm_items SET name = ?, unit = ?, initial_qty = ?, initial_price = ? WHERE id = ?',
      [name, unit, qty, price, existing.id]
    );
    await updateItemQty(config, existing.id);
  } else {
    await dbRun(
      config,
      'INSERT INTO bm_items (org_id, code, name, unit, initial_qty, initial_price, current_qty) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orgId, code, name, unit, qty, price, qty]
    );
  }
  return name;
}

export async function fetchCtsDetailsAction(raw: string) {
  await requireUser();
  const code = String(raw || '').trim();
  if (!code) return { error: 'Код хоосон байна' };
  const { year, month } = currentPeriod();
  try {
    const detail = await fetchAssetDetails({ raw: code, year, month, deviceId: 'WEB' });
    if (!detail) return { error: 'CT-ээс мэдээлэл олдсонгүй' };
    return { ok: true as const, detail };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'CT холболт амжилтгүй' };
  }
}

export async function importCtsItemAction(raw: string, initialQty = 0) {
  const user = await requireUser();
  const config = await getDbConfig();
  const code = String(raw || '').trim();
  if (!code) return { error: 'Код хоосон байна' };
  const { year, month } = currentPeriod();
  try {
    const detail = await fetchAssetDetails({ raw: code, year, month, deviceId: 'WEB' });
    if (!detail) return { error: 'CT-ээс мэдээлэл олдсонгүй (QR/код буруу)' };
    const name = await upsertCtsItem(config, user.org_id, detail.code || code, detail, Number(initialQty) || undefined);
    revalidatePath('/bm/expense');
    return { ok: true as const, detail, name };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'CT холболт амжилтгүй' };
  }
}

export async function importCtsItemsAction(rawList: string, initialQty = 0) {
  const user = await requireUser();
  const config = await getDbConfig();
  const codes = String(rawList || '')
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (codes.length === 0) return { error: 'CT код/QR оруулна уу' };

  const { year, month } = currentPeriod();
  let count = 0;
  const errors: string[] = [];

  for (const code of codes) {
    try {
      const detail = await fetchAssetDetails({ raw: code, year, month, deviceId: 'WEB' });
      if (!detail) {
        errors.push(`${code}: олдсонгүй`);
        continue;
      }
      await upsertCtsItem(config, user.org_id, detail.code || code, detail, Number(initialQty) || undefined);
      count++;
    } catch (err) {
      errors.push(`${code}: ${err instanceof Error ? err.message : 'алдаа'}`);
    }
  }

  revalidatePath('/bm/expense');
  if (count === 0) {
    return { error: errors[0] || 'CT-ээс бараа татаж чадсангүй' };
  }
  return { ok: true as const, count, errors };
}

export async function refreshCtsItemsAction() {
  const user = await requireUser();
  const config = await getDbConfig();
  const items = await dbAll<{ code: string }>(config, 'SELECT code FROM bm_items WHERE org_id = ?', [user.org_id]);
  if (items.length === 0) return { error: 'Эхлээд CT код/QR-аа оруулна уу' };
  const list = items.map((i) => i.code).join('\n');
  return importCtsItemsAction(list);
}

export async function sendCtsAssetAction(raw: string) {
  await requireUser();
  const code = String(raw || '').trim();
  if (!code) return { error: 'Код хоосон байна' };
  const { year, month } = currentPeriod();
  try {
    const result = await sendAssetItem({ raw: code, year, month, deviceId: 'WEB' });
    return { ok: true as const, result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'CT илгээх амжилтгүй' };
  }
}

export async function sendCtsAssetAllAction(payload: unknown) {
  await requireUser();
  try {
    const result = await sendAssetAll(payload);
    return { ok: true as const, result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'CT assetAll амжилтгүй' };
  }
}
