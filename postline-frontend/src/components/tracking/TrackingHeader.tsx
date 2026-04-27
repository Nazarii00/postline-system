import { Package, MapPin, Calendar, Truck } from 'lucide-react';
import type { ParcelData } from '../../types/tracking';

export const TrackingHeader = ({ data }: { data: ParcelData }) => (
  <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Номер накладної</p>
      <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
        {data.trackingNumber}
      </h2>
      <div className="flex flex-wrap items-center gap-4 text-slate-500 mt-4 text-sm font-semibold">
        <span className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400" /> {data.registrationDate}</span>
        <span className="flex items-center gap-1.5"><Package size={16} className="text-slate-400" /> {data.type}</span>
        <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {data.route}</span>
      </div>
    </div>
    <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-2xl font-bold border border-emerald-200 flex items-center gap-3 text-base whitespace-nowrap">
      <Truck size={22} className="text-emerald-600" /> {data.status}
    </div>
  </div>
);
