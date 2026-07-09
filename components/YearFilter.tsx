'use client';

import { useRouter } from 'next/navigation';

export default function YearFilter({ year }: { year: string }) {
  const router = useRouter();
  const years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="flex items-center gap-2 text-sm">
      <label>Тайлант он:</label>
      <select value={year} onChange={(e) => router.push(`/bm/report?year=${e.target.value}`)} className="rounded border px-2 py-1">
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}
