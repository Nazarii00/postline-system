import { Clock, MapPin, Route, Waypoints } from 'lucide-react';
import { OptimizedRouteMap } from '../../OptimizedRouteMap';
import type { OptimizedRouteResult } from '../../../services/routeOptimizationService';
import type { CourierDelivery } from '../../../types/courier';
import { formatDistanceKm, formatDurationMinutes, getRouteOrder } from './courierDeliveryUtils';

type CourierRouteSectionProps = {
  isLoading: boolean;
  deliveries: CourierDelivery[];
  confirmedRoute: OptimizedRouteResult | null;
  onMarkVisited: (deliveryId: number) => void;
};

export const CourierRouteSection = ({
  isLoading,
  deliveries,
  confirmedRoute,
  onMarkVisited,
}: CourierRouteSectionProps) => (
  <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-pine/10 text-pine flex items-center justify-center">
        <Route size={22} />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-900">Мій маршрут</h2>
        <p className="text-sm text-slate-500">
          Перегляд підтвердженого оператором маршруту та відмітка відвіданих адрес.
        </p>
      </div>
    </div>

    {isLoading ? (
      <div className="p-8 text-center text-slate-400">Завантаження...</div>
    ) : deliveries.length === 0 ? (
      <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-400 font-medium">
        Підтвердженого маршруту для вас поки немає
      </div>
    ) : (
      <div className="space-y-5">
        {confirmedRoute ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pine/10 text-pine flex items-center justify-center shrink-0">
                  <Waypoints size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Загальна довжина</p>
                  <p className="text-lg font-black text-slate-900">
                    {formatDistanceKm(confirmedRoute.distanceMeters)} км
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Приблизний час</p>
                  <p className="text-lg font-black text-slate-900">
                    {formatDurationMinutes(confirmedRoute.durationSeconds)} хв
                  </p>
                </div>
              </div>
            </div>

            <OptimizedRouteMap route={confirmedRoute} />
          </>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-sm font-bold">
            Маршрут підтверджено, але координати недоступні для старих записів. Список адрес нижче актуальний.
          </div>
        )}

        <div className="space-y-3">
          {deliveries.map((delivery) => {
            const isVisited = delivery.status === 'in_progress';
            const routeOrder = getRouteOrder(delivery);

            return (
              <div key={delivery.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                    isVisited ? 'bg-emerald-600 text-white' : 'bg-pine text-white'
                  }`}>
                    {routeOrder === Number.MAX_SAFE_INTEGER ? '-' : routeOrder}
                  </span>
                  <div>
                    <p className="font-black text-slate-900">{delivery.tracking_number}</p>
                    <p className="text-sm text-slate-600 flex items-start gap-2 mt-1">
                      <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      {delivery.to_address}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {delivery.receiver_name} · {delivery.receiver_phone}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isVisited}
                  onClick={() => onMarkVisited(delivery.id)}
                  className={`px-5 py-3 rounded-2xl text-sm font-black transition-all ${
                    isVisited
                      ? 'bg-emerald-50 text-emerald-700 cursor-default'
                      : 'bg-pine text-white hover:bg-pine/90 active:scale-95'
                  }`}
                >
                  {isVisited ? 'Відвідано' : 'Позначити відвіданим'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </section>
);
