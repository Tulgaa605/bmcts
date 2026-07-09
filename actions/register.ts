'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { dbGet, dbRun } from '@/lib/db';
import { validateDbConnection } from '@/lib/auth';
import { getDefaultConnectionLabel, resolveDbConfig, useFirebird } from '@/lib/connection';

export async function registerAction(formData: FormData) {
  const dbConnection = (formData.get('db_connection') as string) || getDefaultConnectionLabel();
  const register = (formData.get('register') as string)?.trim();
  const orgName = (formData.get('org_name') as string)?.trim();
  const username = (formData.get('username') as string)?.trim();
  const fullName = (formData.get('full_name') as string)?.trim();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (!register || !orgName || !username || !fullName || !password) {
    return { error: 'Бүх талбарыг бөглөнө үү' };
  }

  if (password.length < 6) {
    return { error: 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой' };
  }

  if (password !== confirmPassword) {
    return { error: 'Нууц үг таарахгүй байна' };
  }

  const connError = await validateDbConnection(dbConnection);
  if (connError) return { error: connError };

  const config = useFirebird() ? resolveDbConfig(dbConnection) : undefined;

  const existingOrg = await dbGet<{ id: number }>(config, 'SELECT id FROM organizations WHERE register = ?', [register]);
  if (existingOrg) {
    return { error: 'Энэ регистертэй байгууллага бүртгэгдсэн байна' };
  }

  const hash = bcrypt.hashSync(password, 10);

  try {
    await dbRun(config, 'INSERT INTO organizations (register, name) VALUES (?, ?)', [register, orgName]);

    const org = await dbGet<{ id: number }>(config, 'SELECT id FROM organizations WHERE register = ?', [register]);
    if (!org) return { error: 'Байгууллага үүсгэхэд алдаа гарлаа' };

    await dbRun(config, 'INSERT INTO users (org_id, username, password, full_name) VALUES (?, ?, ?, ?)', [org.id, username, hash, fullName]);
  } catch {
    return { error: 'Бүртгэл үүсгэхэд алдаа гарлаа. Хэрэглэгчийн нэр давхардаж байж магадгүй.' };
  }

  redirect(`/login?msg=${encodeURIComponent('Амжилттай бүртгэгдлээ. Нэвтэрнэ үү')}`);
}
