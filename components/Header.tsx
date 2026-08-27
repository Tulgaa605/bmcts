'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SessionUser } from '@/lib/session';
import { logoutAction } from '@/actions/auth';

const bmLinks = [
  { href: '/bm/report', label: 'БМ тайлан' },
  { href: '/bm/income', label: 'БМ орлогын бүртгэл' },
  { href: '/bm/expense', label: 'БМ зарлагын бүртгэл' },
  { href: '/bm/sales', label: 'БМ борлуулалтын бүртгэл' },
  { href: '/bm/items', label: 'БМ нэр, эхний үлдэгдэл бүртгэл' },
  { href: '/bm/transfer', label: 'БМ Нярав хоорондох шилжүүлэг' },
  { href: '/bm/inventory', label: 'БМ тооллогын бүртгэл' },
  { href: '/bm/loading', label: 'БО ачилт, буулгалтын бүртгэл' },
];

const disabledMenus = ['МӨНГӨН ХӨРӨНГӨ', 'ҮНДСЭН ХӨРӨНГӨ', 'ЦАЛИН ХӨЛС', 'БАЛАНС, ЖУРНАЛУУД'];

export default function Header({
  user,
  activeMenu,
  dbConnection,
}: {
  user: SessionUser;
  activeMenu?: string;
  dbConnection?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bmOpen, setBmOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setBmOpen(false);
  };

  return (
    <header className="border-b-2 border-nebo-primary bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-50 px-3 py-2 sm:px-5">
        <Link href="/dashboard" className="flex shrink-0 items-baseline gap-1" onClick={closeMenu}>
          <span className="text-xl font-black tracking-wider text-nebo-dark sm:text-2xl">NYBO</span>
          <span className="text-xs font-bold text-red-500 sm:text-sm">2018</span>
        </Link>

        <div className="hidden items-center gap-3 text-sm md:flex lg:gap-4">
          {dbConnection && (
            <span className="hidden max-w-[200px] truncate font-mono text-xs text-nebo-primary lg:inline xl:max-w-none">
              Бааз: {dbConnection}
            </span>
          )}
          <span className="hidden sm:inline">
            Хэрэглэгч: <strong>{user.full_name}</strong>
          </span>
          <form action={logoutAction}>
            <button type="submit" className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600">
              Гарах
            </button>
          </form>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-700 md:hidden"
          aria-label="Цэс нээх"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <nav className="hidden bg-gradient-to-b from-nebo-light to-nebo-primary md:flex">
        <Link
          href="/dashboard"
          className={`px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/20 lg:px-4 ${activeMenu === 'home' ? 'bg-white/20' : ''}`}
        >
          ТУХАЙ
        </Link>

        <div className="group relative">
          <span
            className={`block cursor-default px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/20 lg:px-4 ${activeMenu === 'bm' ? 'bg-white/20' : ''}`}
          >
            БАРАА МАТЕРИАЛ
          </span>
          <div className="absolute left-0 top-full z-50 hidden min-w-[300px] border border-gray-300 bg-white shadow-lg group-hover:block">
            {bmLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block border-b border-gray-100 px-4 py-2.5 text-sm text-gray-700 hover:bg-nebo-primary hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {disabledMenus.map((m) => (
          <span key={m} className="hidden cursor-not-allowed px-3 py-2.5 text-xs font-semibold text-white/50 lg:inline xl:px-4">
            {m}
          </span>
        ))}
      </nav>

      {menuOpen && (
        <div className="border-b border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-3 py-3 text-sm">
            <p className="text-xs text-gray-500">
              Хэрэглэгч: <strong className="text-gray-800">{user.full_name}</strong>
            </p>
            {dbConnection && (
              <p className="truncate font-mono text-xs text-nebo-primary">Бааз: {dbConnection}</p>
            )}
          </div>

          <Link
            href="/dashboard"
            onClick={closeMenu}
            className={`block border-t border-gray-100 px-4 py-3 text-sm font-semibold ${activeMenu === 'home' ? 'bg-nebo-primary/10 text-nebo-primary' : 'text-gray-700'}`}
          >
            ТУХАЙ
          </Link>

          <button
            type="button"
            onClick={() => setBmOpen((v) => !v)}
            className={`flex w-full items-center justify-between border-t border-gray-100 px-4 py-3 text-left text-sm font-semibold ${activeMenu === 'bm' ? 'bg-nebo-primary/10 text-nebo-primary' : 'text-gray-700'}`}
          >
            БАРАА МАТЕРИАЛ
            <span className="text-xs">{bmOpen ? '▲' : '▼'}</span>
          </button>
          {bmOpen && (
            <div className="border-t border-gray-100 bg-slate-50">
              {bmLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  className="block border-b border-gray-100 px-6 py-2.5 text-sm text-gray-700 hover:bg-nebo-primary hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {disabledMenus.map((m) => (
            <span key={m} className="block border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
              {m}
            </span>
          ))}

          <form action={logoutAction} className="border-t border-gray-100 p-3">
            <button type="submit" className="w-full rounded bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600">
              Гарах
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
