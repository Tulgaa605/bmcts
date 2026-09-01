export const CTS_BASE_URL = (process.env.CTS_BASE_URL || 'https://ctsystem.mn').replace(/\/$/, '');
export const CTS_ASSET_TAG = process.env.CTS_ASSET_TAG || 'CT$FS4';

export type CtsAssetInput = {
  raw: string;
  year: number | string;
  month: number | string;
  deviceId?: string;
};

export type CtsDetailItem = {
  code: string;
  name: string;
  lord: string;
  unt: string;
  ognoo: string;
  dans: string;
  une: unknown;
  qty: number;
};

function asNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDetailItem(item: unknown): CtsDetailItem | null {
  if (!item || typeof item !== 'object' || 'error' in item) return null;
  const rec = item as Record<string, unknown>;
  const normalized: CtsDetailItem = {
    code: String(rec.code || rec.Code || rec.kod || rec.qr || rec.raw || ''),
    name: String(rec.name || rec.Name || rec.assetName || rec.ner || ''),
    lord: String(rec.lord || rec.Lord || rec.handler || ''),
    unt: String(rec.unt || rec.unit || rec.unitType || rec.negj || ''),
    ognoo: String(rec.ognoo || rec.date || ''),
    dans: String(rec.dans || rec.account || ''),
    une: rec.une ?? rec.price ?? rec.unitPrice ?? rec.unee,
    qty: asNumber(rec.qty ?? rec.too ?? rec.uldegdel ?? rec.ehni ?? rec.initial_qty ?? rec.stock),
  };
  const hasData =
    normalized.code ||
    normalized.name ||
    normalized.lord ||
    normalized.unt ||
    normalized.dans ||
    normalized.une != null;
  return hasData ? normalized : null;
}

function parseJson(responseText: string): unknown {
  let jsonData: unknown;
  try {
    jsonData = JSON.parse(responseText);
    if (typeof jsonData === 'string') {
      try {
        jsonData = JSON.parse(jsonData);
      } catch {
        return null;
      }
    }
  } catch {
    return null;
  }
  return jsonData;
}

export function parseDetailsList(responseText: string): CtsDetailItem[] {
  const jsonData = parseJson(responseText);
  if (!jsonData || (typeof jsonData === 'object' && 'error' in jsonData)) return [];
  if (Array.isArray(jsonData)) {
    return jsonData.map(normalizeDetailItem).filter((x): x is CtsDetailItem => Boolean(x));
  }
  if (typeof jsonData === 'object' && Array.isArray((jsonData as { data?: unknown }).data)) {
    return ((jsonData as { data: unknown[] }).data)
      .map(normalizeDetailItem)
      .filter((x): x is CtsDetailItem => Boolean(x));
  }
  const one = normalizeDetailItem(jsonData);
  return one ? [one] : [];
}

function parseDetailsBody(responseText: string): CtsDetailItem | null {
  return parseDetailsList(responseText)[0] || null;
}

function ctsUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${CTS_BASE_URL}${p}`;
}

export function buildCtsAssetString({ raw, year, month, deviceId }: CtsAssetInput) {
  return `${raw}^?${year}^?${month}^?${deviceId || 'WEB'}^?${CTS_ASSET_TAG}`;
}

async function postJson(path: string, body: unknown) {
  const url = ctsUrl(path);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/plain, */*' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const responseText = await response.text().catch(() => '');
  return { ok: response.ok, status: response.status, responseText, url };
}

async function requestDetails(payloadString: string) {
  const { ok, status, responseText, url } = await postJson('/api/details', payloadString);
  if (!ok) throw new Error(`CTS details HTTP ${status} (${url})`);
  return parseDetailsBody(responseText);
}

export async function sendAssetString(payloadString: string) {
  const { ok, status, responseText } = await postJson('/api/asset', payloadString);
  if (!ok) {
    throw new Error(`CTS asset HTTP ${status}${responseText ? `: ${responseText.slice(0, 200)}` : ''}`);
  }
  let parsed: unknown = responseText;
  try {
    parsed = JSON.parse(responseText);
  } catch {
  }
  return { status, body: parsed, raw: responseText, sent: payloadString };
}

export async function sendAssetItem(item: CtsAssetInput) {
  return sendAssetString(buildCtsAssetString(item));
}

export async function fetchAssetDetails(item: CtsAssetInput) {
  const extended = buildCtsAssetString(item);
  try {
    const fromExtended = await requestDetails(extended);
    if (fromExtended) return fromExtended;
  } catch {
  }
  return requestDetails(item.raw);
}

export async function sendAssetAll(payload: unknown) {
  const { ok, status, responseText, url } = await postJson('/api/assetAll', payload);
  if (!ok) {
    throw new Error(`CTS assetAll HTTP ${status} (${url})${responseText ? `: ${responseText.slice(0, 200)}` : ''}`);
  }
  let parsed: unknown = responseText;
  try {
    parsed = JSON.parse(responseText);
  } catch {
  }
  return { status, body: parsed, raw: responseText };
}
