import Firebird from 'node-firebird';
import { DbConnectionConfig } from './connection';

function attach(config: DbConnectionConfig): Promise<Firebird.Database> {
  return new Promise((resolve, reject) => {
    Firebird.attach(
      {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        lowercase_keys: true,
      },
      (err, db) => (err ? reject(err) : resolve(db))
    );
  });
}

export async function fbQuery<T>(config: DbConnectionConfig, sql: string, params: unknown[] = []): Promise<T[]> {
  const db = await attach(config);
  try {
    return await new Promise<T[]>((resolve, reject) => {
      db.query(sql, params, (err, result) => (err ? reject(err) : resolve((result as T[]) || [])));
    });
  } finally {
    db.detach();
  }
}

export async function fbGet<T>(config: DbConnectionConfig, sql: string, params: unknown[] = []): Promise<T | undefined> {
  const rows = await fbQuery<T>(config, sql, params);
  return rows[0];
}

export async function fbRun(config: DbConnectionConfig, sql: string, params: unknown[] = []): Promise<void> {
  const db = await attach(config);
  try {
    await new Promise<void>((resolve, reject) => {
      db.query(sql, params, (err) => (err ? reject(err) : resolve()));
    });
  } finally {
    db.detach();
  }
}

export async function fbExec(config: DbConnectionConfig, sql: string): Promise<void> {
  const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);
  for (const statement of statements) {
    await fbRun(config, statement);
  }
}

export async function testConnection(config: DbConnectionConfig): Promise<boolean> {
  try {
    await fbGet(config, 'SELECT 1 as ok FROM RDB$DATABASE');
    return true;
  } catch {
    return false;
  }
}
