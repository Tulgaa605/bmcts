import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDefaultConnectionLabel } from '@/lib/connection';
import RegisterForm from '@/components/RegisterForm';

export default async function RegisterPage() {
  const session = await getSession();
  if (session.user) redirect('/bm/expense');
  return <RegisterForm defaultDb={getDefaultConnectionLabel()} />;
}