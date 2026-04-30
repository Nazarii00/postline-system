import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  confirmCourierRoute,
  optimizeCourierRoute,
  type OptimizedDelivery,
  type OptimizedRouteResult,
} from '../../services/routeOptimizationService';
import type { Courier, CourierDelivery, ReadyForCourierShipment } from '../../types/courier';
import { usePagination } from '../../hooks/usePagination';
import { INPUT_LIMITS, sanitizeAddress } from '../../utils/formUtils';
import { ActiveDeliveriesSection } from '../../components/operator/courier-delivery/ActiveDeliveriesSection';
import { AssignCourierModal } from '../../components/operator/courier-delivery/AssignCourierModal';
import { AssignableShipmentsSection } from '../../components/operator/courier-delivery/AssignableShipmentsSection';
import { CourierRouteSection } from '../../components/operator/courier-delivery/CourierRouteSection';
import { RouteOptimizationSection } from '../../components/operator/courier-delivery/RouteOptimizationSection';
import {
  buildConfirmedRoute,
  COURIER_PAGE_SIZE,
  getRouteOrder,
  hasConfirmedRoute,
  MAX_ROUTE_DELIVERIES,
} from '../../components/operator/courier-delivery/courierDeliveryUtils';

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
  const [routeStops, setRouteStops] = useState<OptimizedDelivery[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isConfirmingRoute, setIsConfirmingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [routeSuccess, setRouteSuccess] = useState('');
  const visibleDeliveries = useMemo(
    () => deliveries
      .filter((delivery) => ['assigned', 'in_progress'].includes(delivery.status))
      .filter((delivery) => !isCourier || hasConfirmedRoute(delivery))
      .sort((left, right) => getRouteOrder(left) - getRouteOrder(right)),
    [deliveries, isCourier]
  );
  const confirmedCourierRoute = useMemo(
    () => (isCourier ? buildConfirmedRoute(visibleDeliveries) : null),
    [isCourier, visibleDeliveries]
  );
  const {
    activePage: activeShipmentsPage,
    endIndex: shipmentsEndIndex,
    pageNumbers: shipmentsPageNumbers,
    paginatedItems: paginatedAssignableShipments,
    setCurrentPage: setShipmentsPage,
    startIndex: shipmentsStartIndex,
    totalItems: totalAssignableShipments,
    totalPages: totalShipmentsPages,
  } = usePagination(shipments, COURIER_PAGE_SIZE);
  const {
    activePage: activeDeliveriesPage,
    endIndex: deliveriesEndIndex,
    pageNumbers: deliveriesPageNumbers,
    paginatedItems: paginatedDeliveries,
    setCurrentPage: setDeliveriesPage,
    startIndex: deliveriesStartIndex,
    totalItems: totalActiveDeliveries,
    totalPages: totalDeliveriesPages,
  } = usePagination(visibleDeliveries, COURIER_PAGE_SIZE);

  const routeCourierNumber = routeCourierId ? Number(routeCourierId) : null;
  const selectedCourierDeliveries = useMemo(
    () => routeCourierNumber
      ? deliveries.filter((delivery) =>
        Number(delivery.courier_id) === routeCourierNumber
        && delivery.status === 'assigned'
        && !hasConfirmedRoute(delivery)
      )
      : [],
    [deliveries, routeCourierNumber]
  );
  const activeConfirmedRouteDeliveries = useMemo(
    () => routeCourierNumber
      ? deliveries.filter((delivery) =>
        Number(delivery.courier_id) === routeCourierNumber
        && ['assigned', 'in_progress'].includes(delivery.status)
        && hasConfirmedRoute(delivery)
      )
      : [],
    [deliveries, routeCourierNumber]
  );
  const hasActiveConfirmedRouteForSelectedCourier = activeConfirmedRouteDeliveries.length > 0;
  const activeRouteBlockMessage = hasActiveConfirmedRouteForSelectedCourier
    ? "У цього кур'єра вже є активний підтверджений маршрут. Новий маршрут можна створити після завершення поточного."
    : '';
  const selectedDeliveryIdSet = useMemo(
    () => new Set(selectedDeliveryIds),
    [selectedDeliveryIds]
  );
  const selectableCourierDeliveries = useMemo(
    () => selectedCourierDeliveries.filter((delivery) => Boolean(delivery.courier_id)),
    [selectedCourierDeliveries]
  );
  const hasSelectedDeliveries = selectedDeliveryIds.length > 0;
  const canOptimizeRoute = Boolean(
    routeCourierNumber
    && startAddress.trim()
    && !hasActiveConfirmedRouteForSelectedCourier
    && selectedDeliveryIds.length >= 2
    && selectedDeliveryIds.length <= MAX_ROUTE_DELIVERIES
  );

  const loadDeliveries = useCallback(async () => {
    const path = isCourier
      ? '/courier-deliveries?confirmedOnly=true'
      : '/courier-deliveries';
    const res = await api.get<{ data: CourierDelivery[] }>(path);
    setDeliveries(res.data);
  }, [isCourier]);

  const loadAssignableShipments = useCallback(async () => {
    const res = await api.get<{ data: ReadyForCourierShipment[] }>('/shipments?courierOnly=true');
    setShipments(res.data);
  }, []);

  useEffect(() => {
    if (isCourier && user?.id) {
      setRouteCourierId(String(user.id));
    }
  }, [isCourier, user?.id]);

  useEffect(() => {
    const requests: Promise<unknown>[] = [loadDeliveries()];

    if (!isCourier) {
      requests.push(
        loadAssignableShipments(),
        api.get<{ data: Courier[] }>(`/operators?departmentId=${user?.departmentId}`)
          .then((res) => setCouriers(res.data.filter((courier) => courier.role === 'courier')))
      );
    }

    Promise.all(requests)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Не вдалося завантажити дані');
      })
      .finally(() => setIsLoading(false));
  }, [isCourier, loadAssignableShipments, loadDeliveries, user?.departmentId]);

  useEffect(() => {
    setSelectedDeliveryIds((prev) =>
      prev.filter((id) => deliveries.some((delivery) => delivery.id === id))
    );
  }, [deliveries]);

  const handleRouteCourierChange = (value: string) => {
    setRouteCourierId(value);
    setSelectedDeliveryIds([]);
    setOptimizedRoute(null);
    setRouteStops([]);
    setRouteError('');
    setRouteSuccess('');
  };

  const handleStartAddressChange = (value: string) => {
    setStartAddress(sanitizeAddress(value));
    setOptimizedRoute(null);
    setRouteStops([]);
    setRouteSuccess('');
  };

  const toggleDeliverySelection = (delivery: CourierDelivery) => {
    const deliveryCourierId = delivery.courier_id ? Number(delivery.courier_id) : null;
    const isSelected = selectedDeliveryIdSet.has(delivery.id);

    if (!deliveryCourierId) {
      setRouteError("Спершу призначте цю доставку кур'єру");
      return;
    }

    if (routeCourierNumber && deliveryCourierId !== routeCourierNumber) {
      setRouteError("Для одного маршруту можна обрати доставки тільки одного кур'єра");
      return;
    }

    const deliveryCourierHasActiveRoute = deliveries.some((item) =>
      Number(item.courier_id) === deliveryCourierId
      && ['assigned', 'in_progress'].includes(item.status)
      && hasConfirmedRoute(item)
    );
    if (deliveryCourierHasActiveRoute && !hasConfirmedRoute(delivery)) {
      setRouteError("У цього кур'єра вже є активний підтверджений маршрут. Завершіть поточні доставки перед створенням нового.");
      return;
    }

    if (!isSelected && selectedDeliveryIds.length >= MAX_ROUTE_DELIVERIES) {
      setRouteError(`Можна оптимізувати не більше ${MAX_ROUTE_DELIVERIES} доставок за раз`);
      return;
    }

    if (!routeCourierNumber) {
      setRouteCourierId(String(deliveryCourierId));
    }

    setRouteError('');
    setRouteSuccess('');
    setOptimizedRoute(null);
    setRouteStops([]);
    setSelectedDeliveryIds((prev) =>
      prev.includes(delivery.id)
        ? prev.filter((id) => id !== delivery.id)
        : [...prev, delivery.id]
    );
  };

  const handleToggleAllCourierDeliveries = () => {
    setRouteSuccess('');
    setOptimizedRoute(null);
    setRouteStops([]);

    if (!routeCourierNumber) {
      setRouteError("Оберіть кур'єра для маршруту");
      return;
    }

    if (hasActiveConfirmedRouteForSelectedCourier) {
      setRouteError(activeRouteBlockMessage);
      return;
    }

    if (selectableCourierDeliveries.length === 0) {
      setRouteError("У цього кур'єра немає призначених доставок");
      return;
    }

    if (hasSelectedDeliveries) {
      setSelectedDeliveryIds([]);
      setRouteError('');
      return;
    }

    const nextDeliveryIds = selectableCourierDeliveries
      .slice(0, MAX_ROUTE_DELIVERIES)
      .map((delivery) => delivery.id);

    setSelectedDeliveryIds(nextDeliveryIds);
    setRouteError(
      selectableCourierDeliveries.length > MAX_ROUTE_DELIVERIES
        ? `Можна оптимізувати не більше ${MAX_ROUTE_DELIVERIES} доставок за раз. Обрано перші ${MAX_ROUTE_DELIVERIES}.`
        : ''
    );
  };

  const handleOptimizeRoute = async () => {
    setRouteError('');
    setRouteSuccess('');
    setOptimizedRoute(null);
    setRouteStops([]);

    if (!routeCourierNumber) {
      setRouteError("Оберіть кур'єра для маршруту");
      return;
    }

    if (hasActiveConfirmedRouteForSelectedCourier) {
      setRouteError(activeRouteBlockMessage);
      return;
    }

    if (!startAddress.trim() || startAddress.trim().length < INPUT_LIMITS.addressMin) {
      setRouteError('Вкажіть стартову адресу');
      return;
    }

    if (selectedDeliveryIds.length < 2) {
      setRouteError('Оберіть щонайменше 2 доставки');
      return;
    }

    if (selectedDeliveryIds.length > MAX_ROUTE_DELIVERIES) {
      setRouteError(`Можна оптимізувати не більше ${MAX_ROUTE_DELIVERIES} доставок за раз`);
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
      setRouteStops(routeResult.orderedDeliveries);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Не вдалося оптимізувати маршрут');
    } finally {
      setIsOptimizing(false);
    }
  };

  const moveRouteStop = (deliveryId: number, direction: -1 | 1) => {
    setRouteSuccess('');
    setRouteStops((prev) => {
      const index = prev.findIndex((delivery) => delivery.id === deliveryId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next.map((delivery, orderIndex) => ({ ...delivery, order: orderIndex + 1 }));
    });
  };

  const handleConfirmRoute = async () => {
    if (!optimizedRoute || !routeCourierNumber) return;

    setRouteError('');
    setRouteSuccess('');
    setIsConfirmingRoute(true);

    try {
      const response = await confirmCourierRoute({
        courierId: routeCourierNumber,
        startAddress: optimizedRoute.start.address || startAddress.trim(),
        distanceMeters: optimizedRoute.distanceMeters,
        durationSeconds: optimizedRoute.durationSeconds,
        geometry: optimizedRoute.geometry,
        stops: routeStops.map((delivery, index) => ({
          deliveryId: delivery.id,
          order: index + 1,
          toAddress: delivery.toAddress,
          resolvedAddress: delivery.resolvedAddress,
          lat: delivery.lat,
          lng: delivery.lng,
        })),
      });

      setRouteSuccess(`${response.message}. № маршруту: ${response.data.id}`);
      await loadDeliveries();
      setSelectedDeliveryIds([]);
      setOptimizedRoute(null);
      setRouteStops([]);
    } catch (err) {
      setRouteError(err instanceof Error ? err.message : 'Не вдалося підтвердити маршрут');
    } finally {
      setIsConfirmingRoute(false);
    }
  };

  const handleAssign = async () => {
    if (!assigningShipment || !selectedCourier || !toAddress || toAddress.trim().length < INPUT_LIMITS.addressMin) return;
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
    status: 'in_progress' | 'delivered' | 'failed',
    failureReason?: string
  ) => {
    setError('');
    try {
      await api.patch(`/courier-deliveries/${deliveryId}/status`, {
        status,
        failureReason: failureReason || null,
      });
      setSelectedDeliveryIds((prev) => prev.filter((id) => id !== deliveryId));
      setOptimizedRoute(null);
      await loadDeliveries();
      if (!isCourier) {
        await loadAssignableShipments();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка при оновленні статусу');
    }
  };

  const getDeliverySelectionBlockReason = (delivery: CourierDelivery) => {
    if (delivery.status !== 'assigned') {
      return "Кур'єр уже відмітив цю адресу, очікується результат доставки";
    }

    if (hasConfirmedRoute(delivery)) {
      return 'Маршрут уже підтверджено оператором';
    }

    if (!delivery.courier_id) {
      return "Спершу призначте кур'єра";
    }

    const deliveryCourierHasActiveRoute = deliveries.some((item) =>
      Number(item.courier_id) === Number(delivery.courier_id)
      && ['assigned', 'in_progress'].includes(item.status)
      && hasConfirmedRoute(item)
    );
    if (deliveryCourierHasActiveRoute) {
      return "У кур'єра вже є активний підтверджений маршрут";
    }

    if (routeCourierNumber && Number(delivery.courier_id) !== routeCourierNumber) {
      return "Ця доставка призначена іншому кур'єру";
    }

    if (!selectedDeliveryIdSet.has(delivery.id) && selectedDeliveryIds.length >= MAX_ROUTE_DELIVERIES) {
      return `Ліміт маршруту: ${MAX_ROUTE_DELIVERIES} доставок`;
    }

    return '';
  };

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
        <AssignableShipmentsSection
          isLoading={isLoading}
          shipments={shipments}
          paginatedShipments={paginatedAssignableShipments}
          pagination={{
            activePage: activeShipmentsPage,
            endIndex: shipmentsEndIndex,
            pageNumbers: shipmentsPageNumbers,
            setCurrentPage: setShipmentsPage,
            startIndex: shipmentsStartIndex,
            totalItems: totalAssignableShipments,
            totalPages: totalShipmentsPages,
          }}
          onStartAssign={(shipment) => {
            setAssigningShipment(shipment);
            setToAddress(shipment.receiver_address || '');
          }}
        />
      )}

      {isCourier && (
        <CourierRouteSection
          isLoading={isLoading}
          deliveries={visibleDeliveries}
          confirmedRoute={confirmedCourierRoute}
          onMarkVisited={(deliveryId) => handleUpdateStatus(deliveryId, 'in_progress')}
        />
      )}

      {!isCourier && (
        <RouteOptimizationSection
          couriers={couriers}
          routeCourierId={routeCourierId}
          startAddress={startAddress}
          selectedDeliveryCount={selectedDeliveryIds.length}
          routeCourierNumber={routeCourierNumber}
          selectedCourierDeliveryCount={selectedCourierDeliveries.length}
          activeConfirmedRouteDeliveryCount={activeConfirmedRouteDeliveries.length}
          hasActiveConfirmedRouteForSelectedCourier={hasActiveConfirmedRouteForSelectedCourier}
          activeRouteBlockMessage={activeRouteBlockMessage}
          selectableCourierDeliveryCount={selectableCourierDeliveries.length}
          hasSelectedDeliveries={hasSelectedDeliveries}
          isOptimizing={isOptimizing}
          canOptimizeRoute={canOptimizeRoute}
          routeError={routeError}
          routeSuccess={routeSuccess}
          optimizedRoute={optimizedRoute}
          routeStops={routeStops}
          isConfirmingRoute={isConfirmingRoute}
          onRouteCourierChange={handleRouteCourierChange}
          onStartAddressChange={handleStartAddressChange}
          onToggleAllCourierDeliveries={handleToggleAllCourierDeliveries}
          onOptimizeRoute={handleOptimizeRoute}
          onMoveRouteStop={moveRouteStop}
          onConfirmRoute={handleConfirmRoute}
        />
      )}

      {!isCourier && (
        <ActiveDeliveriesSection
          isLoading={isLoading}
          deliveries={visibleDeliveries}
          paginatedDeliveries={paginatedDeliveries}
          selectedDeliveryIdSet={selectedDeliveryIdSet}
          pagination={{
            activePage: activeDeliveriesPage,
            endIndex: deliveriesEndIndex,
            pageNumbers: deliveriesPageNumbers,
            setCurrentPage: setDeliveriesPage,
            startIndex: deliveriesStartIndex,
            totalItems: totalActiveDeliveries,
            totalPages: totalDeliveriesPages,
          }}
          getDeliverySelectionBlockReason={getDeliverySelectionBlockReason}
          onToggleDeliverySelection={toggleDeliverySelection}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {assigningShipment && (
        <AssignCourierModal
          shipment={assigningShipment}
          couriers={couriers}
          selectedCourier={selectedCourier}
          toAddress={toAddress}
          isSubmitting={isSubmitting}
          onClose={() => setAssigningShipment(null)}
          onSelectedCourierChange={setSelectedCourier}
          onToAddressChange={(value) => setToAddress(sanitizeAddress(value))}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
};

export default CourierDeliveryPage;
