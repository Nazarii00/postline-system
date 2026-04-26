import { Phone, Clock, ChevronRight, Activity, MapPin, X } from 'lucide-react';
import type { Department } from '../../../types/departments';

const TYPE_LABELS: Record<string, string> = {
  sorting_center: 'Сортувальний центр',
  post_office: 'Відділення',
  pickup_point: 'Пункт видачі',
};

interface Props {
  department: Department;
  onDelete: (id: number) => void;
}

const OfficeCard = ({ department, onDelete }: Props) => (
  <article
    className={`bg-white rounded-3xl border p-6 shadow-sm flex flex-col transition-all ${
      department.deleted_at ? 'opacity-50 border-slate-100' : 'border-slate-200 hover:border-slate-300'
    }`}
  >
    <div className="flex justify-between items-start mb-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-pine/10 rounded-xl flex items-center justify-center text-pine font-black text-lg">
          {department.id}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">{department.city}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{department.address}</p>
        </div>
      </div>
      <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 whitespace-nowrap">
        {TYPE_LABELS[department.type] ?? department.type}
      </span>
    </div>

    <div className="space-y-3 mb-5 pb-5 border-b border-slate-100">
      {department.opening_time && department.closing_time && (
        <div className="flex items-center gap-3 text-slate-600 text-sm">
          <Clock size={16} className="text-pine shrink-0" />
          <span className="font-semibold">
            {department.opening_time.slice(0, 5)} — {department.closing_time.slice(0, 5)}
          </span>
        </div>
      )}
      {department.phone && (
        <div className="flex items-center gap-3 text-slate-600 text-sm">
          <Phone size={16} className="text-pine shrink-0" />
          <span className="font-semibold">{department.phone}</span>
        </div>
      )}
      <div className="flex items-center gap-3 text-slate-600 text-sm">
        <MapPin size={16} className="text-pine shrink-0" />
        <span className="font-semibold">{department.city}</span>
      </div>
    </div>

    <div className="flex items-center gap-1.5 text-sm font-semibold mb-5">
      <Activity size={16} className={department.deleted_at ? 'text-slate-300' : 'text-pine'} />
      <span className={department.deleted_at ? 'text-slate-400' : 'text-pine'}>
        {department.deleted_at ? 'Деактивовано' : 'Активне'}
      </span>
    </div>

    <div className="flex gap-2 mt-auto">
      <button className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-pine hover:text-white transition-colors">
        Деталі <ChevronRight size={18} />
      </button>
      {!department.deleted_at && (
        <button
          onClick={() => onDelete(department.id)}
          className="px-4 py-3 bg-slate-100 text-slate-400 rounded-2xl text-sm font-bold hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  </article>
);

export default OfficeCard;
