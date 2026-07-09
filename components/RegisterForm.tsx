'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { registerAction } from '@/actions/register';

export default function RegisterForm({ defaultDb }: { defaultDb: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => registerAction(formData),
    null
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nebo-dark via-nebo-primary to-nebo-dark px-4 py-6 sm:py-8">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl sm:p-8 md:p-10">
        <div className="mb-6 text-center sm:mb-8">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black tracking-wider text-nebo-dark sm:text-4xl">NEBO</span>
            <span className="text-lg font-bold text-red-500">2018</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Шинэ байгууллага бүртгүүлэх</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Байгууллагын регистер</label>
            <input name="register" required placeholder="Жишээ: 1234567" className="input-field" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Байгууллагын нэр</label>
            <input name="org_name" required placeholder="Байгууллагын нэр" className="input-field" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Овог нэр</label>
            <input name="full_name" required placeholder="Жишээ: О.Оюунцэцэг" className="input-field" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Хэрэглэгчийн нэр</label>
            <input name="username" required placeholder="Хэрэглэгчийн нэр" className="input-field" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Нууц үг</label>
            <input name="password" type="password" required placeholder="Хамгийн багадаа 6 тэмдэгт" className="input-field" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Нууц үг давтах</label>
            <input name="confirm_password" type="password" required placeholder="Нууц үгээ дахин оруулна уу" className="input-field" />
          </div>

          <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-base disabled:opacity-50">
            {pending ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Бүртгэлтэй юу?{' '}
          <Link href="/login" className="font-semibold text-nebo-primary hover:underline">Нэвтрэх</Link>
        </p>
      </div>
    </div>
  );
}
