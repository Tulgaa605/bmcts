'use client';

import { useState } from 'react';

export default function CalcTotalForm({ children, action }: { children: React.ReactNode; action: (formData: FormData) => Promise<void> }) {
  const [total, setTotal] = useState('');

  function handleChange(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const qty = parseFloat(fd.get('qty') as string) || 0;
    const price = parseFloat(fd.get('price') as string) || 0;
    setTotal((qty * price).toLocaleString() + ' ₮');
  }

  return (
    <form action={action} onChange={handleChange} className="space-y-3">
      {children}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500">Нийт</label>
        <input readOnly value={total} className="input-field bg-gray-50" />
      </div>
    </form>
  );
}
