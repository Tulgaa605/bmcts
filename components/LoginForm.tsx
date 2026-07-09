'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction } from '@/actions/auth';

export default function LoginForm({
  defaultDb,
  successMsg,
  nextPath,
}: {
  defaultDb: string;
  successMsg?: string | null;
  nextPath?: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => loginAction(formData),
    null
  );

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundColor: '#f5f7fa',
        backgroundImage: "url('/login-hee.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '41px 41px',
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl sm:p-8 md:p-10">
        <div className="mb-6 text-center sm:mb-8">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black tracking-wider text-nebo-dark sm:text-4xl">NEBO</span>
            <span className="text-lg font-bold text-red-500">2018</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Нягтлан бодох бүртгэлийн систем</p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="db_connection" value={defaultDb} />
          {nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//') && (
            <input type="hidden" name="next" value={nextPath} />
          )}
          {successMsg && (
            <div className="rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{successMsg}</div>
          )}
          {state?.error && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Байгууллагын регистер</label>
            <input name="register" required placeholder="Жишээ: 1234567" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Хэрэглэгчийн нэр</label>
            <input name="username" required placeholder="Хэрэглэгчийн нэр" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Нууц үг</label>
            <input name="password" type="password" required placeholder="Нууц үг" className="input-field" />
          </div>

          <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-base disabled:opacity-50">
            {pending ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Бүртгэлгүй юу?{' '}
          <Link href="/register" className="font-semibold text-nebo-primary hover:underline">Бүртгүүлэх</Link>
        </p>

      </div>
    </div>
  );
}
