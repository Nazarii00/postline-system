import { useEffect, useMemo, useState } from 'react';
import { MapPin, Phone, RefreshCcw, Route, UserCheck, X } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { OptimizedRouteMap } from '../../components/OptimizedRouteMap';
import {
  optimizeCourierRoute,
  type OptimizedRouteResult,
} from '../../services/routeOptimizationService';
import type { Courier, CourierDelivery, ReadyForCourierShipment } from '../../types/courier';

const formatDistanceKm = (meters: number) => (meters / 1000).toFixed(2);
const formatDurationMinutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));

const isCourierShipmentAssignable = (shipment: ReadyForCourierShipment) =>
  shipment.status === 'ready_for_pickup'
  && shipment.current_dept_id !== null
  && Number(shipment.current_dept_id) === Number(shipment.dest_dept_id);

const getCourierShipmentReadiness = (shipment: ReadyForCourierShipment) => {
  if (isCourierShipmentAssignable(shipment)) {
    return {
      label: 'Готове до призначення',
      reason: '',
      className: 'bg-blue-100 text-blue-600',
    };
  }

  if (Number(shipment.current_dept_id) !== Number(shipment.dest_dept_id)) {
    return {
      label: 'Не в кінцевому відділенні',
      reason: `Зараз у відділенні: ${shipment.current_city || 'невідомо'}. Призначення доступне тільки у кінцевому відділенні.`,
      className: 'bg-slate-100 text-slate-500',
    };
  }

  return {
    label: 'Очікує статусу',
    reason: `Поточний статус: ${shipment.status}. Потрібен статус ready_for_pickup.`,
    className: 'bg-amber-100 text-amber-600',
  };
};

const CourierDeliveryPage = () => {
  const user = useAuthStore((state) => state.user);
  const isCourier = user?.role === 'courier';

  const [shipments, setShipments] = useState<ReadyForCourierShipment[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [deliveries, setDeliveries] = useState<CourierDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [assigningShipment, setAssigningShipment] = useState<ReadyForCourierShipment | null>(null);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [routeCourierId, setRouteCourierId] = useState(isCourier && user ? String(user.id) : '');
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<number[]>([]);
  const [startAddress, setStartAddress] = useState('');
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRouteResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeError, setRouteError] = useState('');

  const routeCourierNumber = routeCourierId ? Number(routeCourierId) : null;
  const selectedCourierDeliveries = useMemo(
    () => routeCourierNumber
      ? deliveries.filter((delivery) => Number(delivery.courier_id) === routeCourierNumber)
      : [],
    [deliveries, routeCourierNumber]
  );

  const loadDeliveries = async () => {
    const res = await api.get<{ data: CourierDelivery[] }>('/courier-deliveries?status=assigned');
    setDeliveries(res.data);
  };

  useEffect(() => {
    if (isCourier && user?.id) {
      setRouteCourierId(String(user.id));
    }
  }, [isCourier, user?.id]);

  useEffect(() => {
    const requests: Promise<unknown>[] = [loadDeliveries()];

    if (!isCourier) {
      requests.push(
        api.get<{ data: ReadyForCourierShipment[] }>('/shipments?courierOnly=true')
          .then((res) => setShipments(res.data)),
        api.get<{ data: Courier[] }>(`/operators?departmentId=${user?.departmentId}`)
          .then((res) => setCouriers(res.data.filter((courier) => courier.role === 'courier')))
      );
    }

    Promise.all(requests)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Не вдалося завантажити дані');
      })
      .finally(() => setIsLoading(false));
  }, [isCourier, user?.departmentId]);

  useEffect(() => {
    setSelectedDeliveryIds((prev) =>
      prev.filter((id) => deliveries.some((delivery) => delivery.id === id))
    );
  }, [deliveries]);

  const handleRouteCourierChange = (value: string) => {
    setRouteCourierId(value);
    setSelectedDeliveryIds([]);
    setOptimizedRoute(null);
    setRouteError('');
  };

  const toggleDeliverySelection = (delivery: CourierDelivery) => {
    const deliveryCourierId = delivery.courier_id ? Number(delivery.courier_id) : null;

    if (!deliveryCourierId) {
      setRouteError("Спершу призначте цю доставку кур'єру");
      return;
    }

    if (routeCourierNumber && deliveryCourierId !== routeCourierNumber) {
      setRouteError("Для одного маршруту можна обрати доставки тільки одного кур'єра");
      return;
    }

    if (!routeCourierNumber) {
      setRouteCourierId(String(deliveryCourierId));
    }

    setRouteError('');
    setOptimizedRoute(null);
    setSelectedDeliveryIds((prev) =>
      prev.includes(delivery.id)
        ? prev.filter((id) => id !== delivery.id)
        : [...prev, delivery.id]
    );
  };

  const handleOptimizeRoute = async () => {
    setRouteError('');
    setOptimizedRoute(null);

    if (!routeCourierNumber) {
      setRouteError("Оберіть кур'єра для маршруту");
      return;
    }

    if (!startAddress.trim()) {
      setRouteError('Вкажіть стартову адресу');
      return;
    }

    if (selectedDeliveryIds.length < 2) {
      setRouteError('Оберіть щонайменше 2 доставки');
      return;
    }

    setIsOptimizing(true);
    try {
      const routeResult = await optimizeCourierRoute({
        courierId: routeCourierNumber,
        startAddress: startAddress.trim(),
        deliveryIds: selectedDeliveryIds,
      });
      setOptimizedRoute(routeResult);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Не вдалося оптимізувати маршрут');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAssign = async () => {
    if (!assigningShipment || !selectedCourier || !toAddress) return;
    setIsSubmitting(true);

    try {
      await api.post('/courier-deliveries', {
        shipmentId: assigningShipment.id,
        courierId: Number(selectedCourier),
        toAddress,
      });

      setShipments((prev) => prev.filter((shipment) => shipment.id !== assigningShipment.id));
      setAssigningShipment(null);
      setSelectedCourier('');
      setToAddress('');

      await loadDeliveries();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Помилка при призначенні кур'єра");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    deliveryId: number,
    status: 'delivered' | 'failed',
    failureReason?: string
  ) => {
    try {
      await api.patch(`/courier-deliveries/${deliveryId}/status`, {
        status,
        failureReason: failureReason || null,
      });
      setSelectedDeliveryIds((prev) => prev.filter((id) => id !== deliveryId));
      setOptimizedRoute(null);
      await loadDeliveries();
    } catch {
      setError('Помилка при оновленні статусу');
    }
  };

  const canSelectDelivery = (delivery: CourierDelivery) =>
    Boolean(
      delivery.courier_id
      && (!routeCourierNumber || Number(delivery.courier_id) === routeCourierNumber)
    );

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Кур'єрська доставка
          </h1>
          <p className="text-slate-500 text-base mt-2">
            Завдання на адресну доставку з вашого відділення
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-medium">
          {error}
        </div>
      )}

      {!isCourier && (
        <div>
          <h2 className="text-lg font-black text-slate-700 mb-4">
            Кур'єрські відправлення
          </h2>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Завантаження...</div>
          ) : shipments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 font-medium">
              Немає кур'єрських відправлень для вашого кінцевого відділення
            </div>
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => {
                const isAssignable = isCourierShipmentAssignable(shipment);
                const readiness = getCourierShipmentReadiness(shipment);

                return (
                  <div
                    key={shipment.id}
                    className={`bg-white p-6 rounded-3xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                      isAssignable
                        ? 'border-slate-200 hover:shadow-lg hover:border-slate-300'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="font-bold text-slate-900 text-lg">{shipment.tracking_number}</span>
                        <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${readiness.className}`}>
                          {readiness.label}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-700 flex items-start gap-2 font-medium">
                          <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                          {shipment.receiver_address || shipment.dest_city}
                        </p>
                        <p className="text-sm text-slate-700 flex items-center gap-2 font-medium">
                          <Phone size={16} className="text-slate-400 shrink-0" />
                          {shipment.receiver_phone}
                          <span className="text-slate-500 font-normal">({shipment.receiver_name})</span>
                        </p>
                        {!isAssignable && (
                          <p className="text-xs text-slate-500 font-medium">
                            {readiness.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                      <button
                        disabled={!isAssignable}
                        title={isAssignable ? undefined : readiness.reason}
                        onClick={() => {
                          if (!isAssignable) return;
                          setAssigningShipment(shipment);
                          setToAddress(shipment.receiver_address || '');
                        }}
                        className={`w-full md:w-auto px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                          isAssignable
                            ? 'bg-pine text-white hover:bg-pine/90 active:scale-95 shadow-lg'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isAssignable ? "Призначити кур'єра" : 'Очікує готовності'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                  Оберіть assigned-доставки одного кур'єра та отримайте порядок з Mapbox.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full lg:max-w-3xl">
            {!isCourier ? (
              <select
                value={routeCourierId}
                onChange={(event) => handleRouteCourierChange(event.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
              >
                <option value="">Оберіть кур'єра...</option>
                {couriers.map((courier) => (
                  <option key={courier.id} value={courier.id}>
                    {courier.full_name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600">
                Ваш маршрут
              </div>
            )}

            <input
              type="text"
              value={startAddress}
              onChange={(event) => {
                setStartAddress(event.target.value);
                setOptimizedRoute(null);
              }}
              placeholder="Стартова адреса, наприклад: Львів, вул. Городоцька 10"
              className="md:col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className="text-sm text-slate-500">
            Обрано: <span className="font-black text-pine">{selectedDeliveryIds.length}</span>
            {routeCourierNumber && (
              <span> · assigned у кур'єра: {selectedCourierDeliveries.length}</span>
            )}
          </p>
          <button
            type="button"
            onClick={handleOptimizeRoute}
            disabled={isOptimizing}
            className="px-6 py-3 bg-pine text-white rounded-2xl font-black text-sm hover:bg-pine/90 transition-all disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {isOptimizing ? <RefreshCcw size={18} className="animate-spin" /> : <Route size={18} />}
            {isOptimizing ? 'Оптимізація...' : 'Оптимізувати маршрут'}
          </button>
        </div>

        {routeError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold">
            {routeError}
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-2 bg-slate-50 rounded-3xl border border-slate-200 p-4 space-y-3">
                <p className="text-sm font-black text-slate-700">Порядок доставок</p>
                {optimizedRoute.orderedDeliveries.map((delivery) => (
                  <div key={delivery.id} className="bg-white border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-xl bg-pine text-white flex items-center justify-center text-sm font-black">
                        {delivery.order}
                      </span>
                      <span className="font-black text-slate-900">{delivery.trackingNumber}</span>
                    </div>
                    <p className="text-sm text-slate-600">{delivery.toAddress}</p>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-3">
                <OptimizedRouteMap route={optimizedRoute} />
              </div>
            </div>
          </div>
        )}
      </section>

      <div>
        <h2 className="text-lg font-black text-slate-700 mb-4">Активні доставки</h2>
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Завантаження...</div>
        ) : deliveries.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 font-medium">
            Активних кур'єрських доставок немає
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => {
              const isSelectable = canSelectDelivery(delivery);
              const isSelected = selectedDeliveryIds.includes(delivery.id);

              return (
                <div
                  key={delivery.id}
                  className={`bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                    isSelected ? 'border-pine ring-2 ring-pine/10' : 'border-amber-200'
                  }`}
                >
                  <div className="flex gap-4 flex-1">
                    <label className={`pt-1 ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isSelectable}
                        onChange={() => toggleDeliverySelection(delivery)}
                        className="w-5 h-5 rounded border-slate-300 accent-pine"
                      />
                    </label>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-bold text-slate-900">{delivery.tracking_number}</span>
                        <span className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase bg-amber-100 text-amber-600">
                          Призначено
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 flex items-start gap-2">
                        <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        {delivery.to_address}
                      </p>
                      {delivery.courier_name && (
                        <p className="text-sm text-slate-600 flex items-center gap-2 mt-2 font-medium">
                          <UserCheck size={16} className="text-emerald-500" />
                          {delivery.courier_name}
                        </p>
                      )}
                      {!isSelectable && (
                        <p className="text-xs text-slate-500 mt-2 font-medium">
                          {delivery.courier_id
                            ? "Ця доставка призначена іншому кур'єру"
                            : "Спершу призначте кур'єра"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(delivery.id, 'delivered')}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all"
                    >
                      Вручено
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(delivery.id, 'failed', 'Клієнта немає на місці')}
                      className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-200 transition-all"
                    >
                      Невдача
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {assigningShipment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">Призначити кур'єра</h3>
              <button
                onClick={() => setAssigningShipment(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Відправлення</p>
                <p className="font-bold text-pine">{assigningShipment.tracking_number}</p>
                <p className="text-sm text-slate-600">{assigningShipment.receiver_name}</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
                  Кур'єр <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
                >
                  <option value="">Оберіть кур'єра...</option>
                  {couriers.map((courier) => (
                    <option key={courier.id} value={courier.id}>{courier.full_name} · {courier.phone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
                  Адреса доставки <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="вул. Шевченка 1, кв. 5"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
                />
              </div>

              <button
                onClick={handleAssign}
                disabled={!selectedCourier || !toAddress || isSubmitting}
                className="w-full py-4 bg-pine text-white font-black rounded-2xl hover:bg-pine/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Збереження...' : 'Призначити'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierDeliveryPage;
