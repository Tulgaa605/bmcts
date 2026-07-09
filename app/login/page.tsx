import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDefaultConnectionLabel } from '@/lib/connection';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ msg?: string; next?: string }> }) {
  const session = await getSession();
  if (session.user) redirect('/dashboard');
  const { msg, next } = await searchParams;
  return <LoginForm defaultDb={getDefaultConnectionLabel()} successMsg={msg} nextPath={next} />;
}
