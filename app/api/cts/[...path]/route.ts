import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { CTS_BASE_URL } from '@/lib/cts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function proxy(request: NextRequest, pathParts: string[]) {
  const sessionRes = NextResponse.next();
  const session = await getIronSession<SessionData>(request, sessionRes, sessionOptions);
  if (!session.user) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
  }

  const search = request.nextUrl.search;
  const target = `${CTS_BASE_URL}/api/${pathParts.join('/')}${search}`;
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('accept', request.headers.get('accept') || 'application/json, text/plain, */*');

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const upstream = await fetch(target, init);
  const body = await upstream.arrayBuffer();
  const resHeaders = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) resHeaders.set('content-type', upstreamType);

  return new NextResponse(body, { status: upstream.status, headers: resHeaders });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path || []);
}
export async function POST(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path || []);
}
export async function PUT(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path || []);
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path || []);
}
export async function DELETE(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).path || []);
}
