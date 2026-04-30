import { Clock } from 'lucide-react';
import type { StatusEvent } from './shipmentDetailTypes';
import { getTimelineDot, STATUS_LABELS } from './shipmentDetailUtils';

type ShipmentTimelineCardProps = {
  history: StatusEvent[];
};

export const ShipmentTimelineCard = ({ history }: ShipmentTimelineCardProps) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6">
    <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
      <Clock size={18} className="text-pine" /> Хронологія
    </h2>
    {history.length === 0 ? (
      <p className="text-slate-400 text-sm">Немає записів</p>
    ) : (
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100" />
        <div className="space-y-4">
          {history.map((event, index) => (
            <div key={index} className="relative flex gap-4 pl-10">
              <div className={`absolute left-0 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${getTimelineDot(event.status_set)}`} />
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm">
                    {STATUS_LABELS[event.status_set] ?? event.status_set}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(event.created_at).toLocaleString('uk-UA')}
                  </span>
                </div>
                {event.department_city && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {event.department_city}, {event.department_address}
                  </p>
                )}
                {event.operator_name && (
                  <p className="text-xs text-slate-400">Оператор: {event.operator_name}</p>
                )}
                {event.notes && (
                  <p className="text-xs text-slate-500 italic mt-1">{event.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
