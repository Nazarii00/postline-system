import { ChevronDown, ChevronUp, Clock, MapPin, Trash2 } from 'lucide-react';
import type { RouteSummary } from '../../../types/routes';
import { formatRouteDistance, formatRouteTime } from './routeFormatters';

type RouteCardProps = {
  route: RouteSummary;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

export const RouteCard = ({
  route,
  isExpanded,
  onToggle,
  onDelete,
}: RouteCardProps) => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
    <div
      className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all"
      onClick={onToggle}
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-pine/5 text-pine rounded-2xl">
          <MapPin size={20} />
        </div>
        <div>
          <p className="font-black text-slate-800">
            {route.start_city} - {route.end_city}
          </p>
          <div className="flex gap-4 mt-1">
            {route.distance_km !== null && route.distance_km !== undefined && (
              <span className="text-xs text-slate-400 font-medium">
                {formatRouteDistance(route.distance_km)}
              </span>
            )}
            {route.est_time_hours !== null && route.est_time_hours !== undefined && (
              <span className="text-xs text-slate-400 font-medium">
                ~{formatRouteTime(route.est_time_hours)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-all"
          title="Деактивувати"
        >
          <Trash2 size={18} />
        </button>
        {isExpanded
          ? <ChevronUp size={20} className="text-slate-400" />
          : <ChevronDown size={20} className="text-slate-400" />
        }
      </div>
    </div>

    {isExpanded && route.stops && (
      <div className="border-t border-slate-100 px-6 pb-6 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <MapPin size={18} className="text-pine shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-black">
                Загальна відстань
              </p>
              <p className="text-sm font-black text-slate-800">
                {formatRouteDistance(route.distance_km)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <Clock size={18} className="text-pine shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-black">
                Орієнтовний час
              </p>
              <p className="text-sm font-black text-slate-800">
                {formatRouteTime(route.est_time_hours)}
              </p>
            </div>
          </div>
        </div>
        {route.stops.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium">Проміжних зупинок немає</p>
        ) : (
          <div className="space-y-2">
            {route.stops.map((stop, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-pine/10 text-pine text-xs font-black flex items-center justify-center shrink-0">
                  {stop.sequence_order}
                </span>
                <span className="font-medium text-slate-700">
                  {stop.city} - {stop.address}
                </span>
                {stop.distance_from_prev_km && (
                  <span className="text-xs text-slate-400 ml-auto">
                    {stop.distance_from_prev_km} км
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);
