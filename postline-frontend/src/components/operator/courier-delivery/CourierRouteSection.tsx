import { MapPin, Route } from 'lucide-react';
import { OptimizedRouteMap } from '../../OptimizedRouteMap';
import type { OptimizedRouteResult } from '../../../services/routeOptimizationService';
import type { CourierDelivery } from '../../../types/courier';
import { getRouteOrder } from './courierDeliveryUtils';

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
          <OptimizedRouteMap route={confirmedRoute} />
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
