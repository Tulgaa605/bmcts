export interface DbConnectionConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  label: string;
}

export function parseConnectionString(raw: string): Omit<DbConnectionConfig, 'user' | 'password'> & { label: string } {
  const trimmed = raw.trim();
  const slash = trimmed.indexOf('/');
  if (slash === -1) {
    return { host: 'localhost', port: 3050, database: trimmed, label: trimmed };
  }

  const hostPart = trimmed.slice(0, slash);
  const database = trimmed.slice(slash + 1);
  let host = hostPart;
  let port = 3050;

  if (hostPart.includes(':')) {
    const [h, p] = hostPart.split(':');
    host = h;
    port = parseInt(p, 10) || 3050;
  }

  return { host, port, database, label: trimmed };
}

export function getDefaultConnectionLabel() {
  return process.env.DATABASE_CONNECTION || 'ctsystem.mn/CT$FS4';
}

export function getDefaultDbConfig(): DbConnectionConfig {
  const parsed = parseConnectionString(getDefaultConnectionLabel());
  return {
    ...parsed,
    user: process.env.FB_USER || 'SYSDBA',
    password: process.env.FB_PASSWORD || 'masterkey',
  };
}

export function resolveDbConfig(connection?: string): DbConnectionConfig {
  const label = connection || getDefaultConnectionLabel();
  const parsed = parseConnectionString(label);
  return {
    ...parsed,
    user: process.env.FB_USER || 'SYSDBA',
    password: process.env.FB_PASSWORD || 'masterkey',
  };
}

export function useFirebird() {
  return process.env.DB_MODE !== 'sqlite';
}
