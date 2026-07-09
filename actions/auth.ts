'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { dbGet } from '@/lib/db';
import { getSession, validateDbConnection } from '@/lib/auth';
import { getDefaultConnectionLabel, resolveDbConfig, useFirebird } from '@/lib/connection';

export async function loginAction(formData: FormData) {
  const register = formData.get('register') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const dbConnection = (formData.get('db_connection') as string) || getDefaultConnectionLabel();

  const connError = await validateDbConnection(dbConnection);
  if (connError) return { error: connError };

  const config = useFirebird() ? resolveDbConfig(dbConnection) : undefined;

  const org = await dbGet<{ id: number; register: string; name: string }>(
    config,
    'SELECT * FROM organizations WHERE register = ?',
    [register]
  );

  if (!org) return { error: 'Байгууллагын регистер олдсонгүй' };

  const user = await dbGet<{ id: number; username: string; password: string; full_name: string }>(
    config,
    'SELECT * FROM users WHERE org_id = ? AND username = ?',
    [org.id, username]
  );

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return { error: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу' };
  }

  const session = await getSession();
  session.user = {
    id: user.id,
    org_id: org.id,
    username: user.username,
    full_name: user.full_name,
    org_name: org.name,
    org_register: org.register,
  };
  session.dbConnection = dbConnection;
  await session.save();
  redirect('/dashboard');
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}
