import { History } from 'lucide-react';
import type { StatusHistoryItem } from './statusChangeTypes';
import { getBadgeClass, STATUS_LABELS } from './statusChangeUtils';

type StatusSessionHistoryProps = {
  history: StatusHistoryItem[];
};

export const StatusSessionHistory = ({ history }: StatusSessionHistoryProps) => (
  <div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 bg-pine/5 text-pine rounded-xl">
        <History size={20} />
      </div>
      <h3 className="text-lg font-black text-slate-800 tracking-tight">Історія сесії</h3>
    </div>

    <div className="space-y-4">
      {history.length > 0 ? (
        history.map((item, index) => (
          <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-pine/20 transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="font-black text-slate-800 text-sm">{item.tracking_number}</p>
              <p className="text-[10px] text-slate-400 font-bold">{item.time}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Статус:</span>
              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getBadgeClass(item.newStatus)}`}>
                {STATUS_LABELS[item.newStatus]}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm font-bold text-slate-400">Історія порожня</p>
        </div>
      )}
    </div>
  </div>
);
