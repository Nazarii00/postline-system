import {
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Route,
  X,
} from 'lucide-react';
import { OptimizedRouteMap } from '../../OptimizedRouteMap';
import type { OptimizedDelivery, OptimizedRouteResult } from '../../../services/routeOptimizationService';
import type { Courier } from '../../../types/courier';
import { INPUT_LIMITS } from '../../../utils/formUtils';
import {
  formatDistanceKm,
  formatDurationMinutes,
  MAX_ROUTE_DELIVERIES,
} from './courierDeliveryUtils';

type RouteOptimizationSectionProps = {
  couriers: Courier[];
  routeCourierId: string;
  startAddress: string;
  selectedDeliveryCount: number;
  routeCourierNumber: number | null;
  selectedCourierDeliveryCount: number;
  activeConfirmedRouteDeliveryCount: number;
  hasActiveConfirmedRouteForSelectedCourier: boolean;
  activeRouteBlockMessage: string;
  selectableCourierDeliveryCount: number;
  hasSelectedDeliveries: boolean;
  isOptimizing: boolean;
  canOptimizeRoute: boolean;
  routeError: string;
  routeSuccess: string;
  optimizedRoute: OptimizedRouteResult | null;
  routeStops: OptimizedDelivery[];
  isConfirmingRoute: boolean;
  onRouteCourierChange: (value: string) => void;
  onStartAddressChange: (value: string) => void;
  onToggleAllCourierDeliveries: () => void;
  onOptimizeRoute: () => void;
  onMoveRouteStop: (deliveryId: number, direction: -1 | 1) => void;
  onConfirmRoute: () => void;
};

export const RouteOptimizationSection = ({
  couriers,
  routeCourierId,
  startAddress,
  selectedDeliveryCount,
  routeCourierNumber,
  selectedCourierDeliveryCount,
  activeConfirmedRouteDeliveryCount,
  hasActiveConfirmedRouteForSelectedCourier,
  activeRouteBlockMessage,
  selectableCourierDeliveryCount,
  hasSelectedDeliveries,
  isOptimizing,
  canOptimizeRoute,
  routeError,
  routeSuccess,
  optimizedRoute,
  routeStops,
  isConfirmingRoute,
  onRouteCourierChange,
  onStartAddressChange,
  onToggleAllCourierDeliveries,
  onOptimizeRoute,
  onMoveRouteStop,
  onConfirmRoute,
}: RouteOptimizationSectionProps) => (
  <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
    <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-pine/10 text-pine flex items-center justify-center">
            <Route size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Оптимізація маршруту</h2>
            <p className="text-sm text-slate-500">
              Оберіть призначені доставки одного кур'єра та отримайте оптимальний порядок.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full lg:max-w-3xl">
        <select
          value={routeCourierId}
          onChange={(event) => onRouteCourierChange(event.target.value)}
          required
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
        >
          <option value="">Оберіть кур'єра...</option>
          {couriers.map((courier) => (
            <option key={courier.id} value={courier.id}>
              {courier.full_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={startAddress}
          onChange={(event) => onStartAddressChange(event.target.value)}
          placeholder="Стартова адреса, наприклад: Львів, вул. Городоцька 10"
          required
          minLength={INPUT_LIMITS.addressMin}
          maxLength={INPUT_LIMITS.addressMax}
          className="md:col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
        />
      </div>
    </div>

    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <p className="text-sm text-slate-500">
        Обрано: <span className="font-black text-pine">{selectedDeliveryCount}/{MAX_ROUTE_DELIVERIES}</span>
        {routeCourierNumber && (
          <span> · призначених у кур'єра: {selectedCourierDeliveryCount}</span>
        )}
        {hasActiveConfirmedRouteForSelectedCourier && (
          <span> · доставок в активному маршруті: {activeConfirmedRouteDeliveryCount}</span>
        )}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onToggleAllCourierDeliveries}
          disabled={!routeCourierNumber || hasActiveConfirmedRouteForSelectedCourier || selectableCourierDeliveryCount === 0}
          className="px-5 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {hasSelectedDeliveries ? <X size={18} /> : <CheckSquare size={18} />}
          {hasSelectedDeliveries ? 'Очистити вибір' : 'Обрати доставки'}
        </button>
        <button
          type="button"
          onClick={onOptimizeRoute}
          disabled={isOptimizing || !canOptimizeRoute}
          className="px-6 py-3 bg-pine text-white rounded-2xl font-black text-sm hover:bg-pine/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isOptimizing ? <RefreshCcw size={18} className="animate-spin" /> : <Route size={18} />}
          {isOptimizing ? 'Оптимізація...' : 'Оптимізувати маршрут'}
        </button>
      </div>
    </div>

    {hasActiveConfirmedRouteForSelectedCourier && !routeSuccess && (
      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-sm font-bold">
        {activeRouteBlockMessage}
      </div>
    )}

    {routeError && (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold">
        {routeError}
      </div>
    )}

    {routeSuccess && (
      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-bold">
        {routeSuccess}
      </div>
    )}

    {optimizedRoute && (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-pine/5 border border-pine/10 rounded-2xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-black">Загальна дистанція</p>
            <p className="text-3xl font-black text-pine mt-1">
              {formatDistanceKm(optimizedRoute.distanceMeters)} км
            </p>
          </div>
          <div className="p-4 bg-pine/5 border border-pine/10 rounded-2xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-black">Орієнтовна тривалість</p>
            <p className="text-3xl font-black text-pine mt-1">
              {formatDurationMinutes(optimizedRoute.durationSeconds)} хв
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onConfirmRoute}
            disabled={isConfirmingRoute || routeStops.length === 0}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {isConfirmingRoute ? <RefreshCcw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {isConfirmingRoute ? 'Підтвердження...' : 'Підтвердити маршрут'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 bg-slate-50 rounded-3xl border border-slate-200 p-4 space-y-3">
            <p className="text-sm font-black text-slate-700">Порядок доставок</p>
            {routeStops.map((delivery, index) => (
              <div key={delivery.id} className="bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-pine text-white flex items-center justify-center text-sm font-black">
                    {index + 1}
                  </span>
                  <span className="font-black text-slate-900">{delivery.trackingNumber}</span>
                  <div className="ml-auto flex gap-1">
                    <button
                      type="button"
                      title="Вище"
                      disabled={index === 0}
                      onClick={() => onMoveRouteStop(delivery.id, -1)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pine hover:bg-pine/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      title="Нижче"
                      disabled={index === routeStops.length - 1}
                      onClick={() => onMoveRouteStop(delivery.id, 1)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-pine hover:bg-pine/5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{delivery.toAddress}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-3">
            <OptimizedRouteMap route={{ ...optimizedRoute, orderedDeliveries: routeStops }} />
          </div>
        </div>
      </div>
    )}
  </section>
);
