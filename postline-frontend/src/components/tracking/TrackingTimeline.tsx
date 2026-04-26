import { AlertCircle, CheckCircle2, CircleDashed } from 'lucide-react';
import { type TrackingHistoryItem } from '../../types/tracking';

interface Props {
  history: TrackingHistoryItem[];
  rawStatus: string;
}

export const TrackingTimeline = ({ history, rawStatus }: Props) => (
  <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
    <h3 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-5">
      Історія переміщень
    </h3>
    <div className="flex flex-col ml-2 space-y-6">
      {history.map((item, index) => {
        const isLast = index === history.length - 1;
        return (
          <div key={index} className="flex gap-5 group relative">
            {!isLast && (
              <div className={`absolute top-10 bottom-[-24px] left-[19px] w-[2px] rounded-full ${
                item.isCompleted ? 'bg-pine/30' : 'bg-slate-100'
              }`} />
            )}
            <div className="flex flex-col items-center shrink-0 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                item.isAlert ? 'bg-red-100 text-red-500 border-2 border-red-200' 
                : item.isCompleted ? 'bg-pine text-white shadow-sm' 
                : 'bg-slate-50 text-slate-300 border-2 border-slate-200'
              }`}>
                {item.isAlert ? <AlertCircle size={20} /> : item.isCompleted ? <CheckCircle2 size={20} /> : <CircleDashed size={20} />}
              </div>
            </div>
            <div className="pt-2 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h4 className={`text-base font-bold ${
                  item.isAlert ? 'text-red-600' : item.isCompleted ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {item.status}
                </h4>
                {item.date && <span className="text-sm font-semibold text-slate-400">{item.date}</span>}
              </div>
              <p className={`text-sm mt-2 font-medium ${item.isAlert ? 'text-red-500' : item.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                {item.location}
              </p>
              {item.actor && <p className="text-xs text-slate-400 mt-2.5 font-semibold">{item.actor}</p>}
            </div>
          </div>
        );
      })}
    </div>
    {rawStatus === 'accepted' && (
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <button className="text-slate-500 hover:text-red-600 font-bold transition-all text-sm px-4 py-2.5 hover:bg-red-50 rounded-lg -ml-4">
          Скасувати відправлення
        </button>
      </div>
    )}
  </div>
);