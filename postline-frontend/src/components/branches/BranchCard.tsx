import { Clock, Phone } from 'lucide-react';
import { type Branch } from '../../types/branches';

interface Props {
  branch: Branch;
}

export const BranchCard = ({ branch }: Props) => (
  <div className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-pine hover:shadow-lg hover:bg-slate-50/50 cursor-pointer transition-all group">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-pine transition-colors">
          Відділення {branch.number}
        </h3>
        <p className="text-sm font-semibold text-slate-500 mt-1">{branch.type}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
          {branch.maxWeight}
        </span>
        {branch.openNow ? (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Відчинено
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-red-500" /> Зачинено
          </span>
        )}
      </div>
    </div>

    <p className="text-base text-slate-800 font-semibold mb-4">
      {branch.city}, {branch.address}
    </p>

    <div className="space-y-2 bg-slate-50 p-3 rounded-2xl">
      <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
        <Clock size={16} className="shrink-0 mt-0.5 text-pine" />
        <span className="leading-tight">{branch.schedule}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
        <Phone size={16} className="shrink-0 text-pine" />
        <span>{branch.phone}</span>
      </div>
    </div>
  </div>
);
