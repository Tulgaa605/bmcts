import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SessionData, sessionOptions } from './session';
import { DbConnectionConfig, getDefaultConnectionLabel, resolveDbConfig, useFirebird } from './connection';
import { testConnection } from './firebird';

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session.user) redirect('/login');
  return session.user;
}

export async function getDbConfig(): Promise<DbConnectionConfig | undefined> {
  const session = await getSession();
  if (!useFirebird()) return undefined;
  return resolveDbConfig(session.dbConnection || getDefaultConnectionLabel());
}

export async function validateDbConnection(connection: string): Promise<string | null> {
  if (!useFirebird()) return null;
  const config = resolveDbConfig(connection);
  const ok = await testConnection(config);
  if (!ok) return `Баазын холболт амжилтгүй: ${connection}`;
  return null;
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function formatMoney(n: number) {
  return n.toLocaleString('mn-MN') + ' ₮';
}
