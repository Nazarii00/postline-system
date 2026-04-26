import { type ReactNode} from 'react';

interface DetailItem {
  label: string;
  value: string | ReactNode;
  isHighlight?: boolean;
}

interface Props {
  title: string;
  icon: ReactNode;
  items: DetailItem[];
}

export const TrackingDetailCard = ({ title, icon, items }: Props) => (
  <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
    <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
      <div className="p-2 bg-pine/10 rounded-lg text-pine">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="space-y-4 text-sm">
      {items.map((item, idx) => (
        <div key={idx} className={`flex ${item.isHighlight ? 'justify-between items-center' : 'flex-col'}`}>
          <span className="text-slate-400 text-xs mb-1 font-semibold uppercase">{item.label}</span>
          <span className={`font-semibold ${item.isHighlight ? 'text-pine text-lg font-black' : 'text-slate-900'}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </div>
);