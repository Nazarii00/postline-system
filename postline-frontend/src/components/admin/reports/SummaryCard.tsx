import type { ReactNode } from 'react';

type SummaryCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
};

export const SummaryCard = ({ icon, label, value, hint }: SummaryCardProps) => (
  <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[156px] flex flex-col">
    <div className="w-11 h-11 rounded-xl bg-pine/10 text-pine flex items-center justify-center mb-4">
      {icon}
    </div>
    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    <p className="text-sm font-semibold text-slate-600 mt-auto pt-3">{label}</p>
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </article>
);
