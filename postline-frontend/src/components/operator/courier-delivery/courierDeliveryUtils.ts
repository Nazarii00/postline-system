import type { OptimizedRouteResult } from '../../../services/routeOptimizationService';
import type { CourierDelivery, ReadyForCourierShipment } from '../../../types/courier';

export const formatDistanceKm = (meters: number) => (meters / 1000).toFixed(2);
export const formatDurationMinutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));
export const MAX_ROUTE_DELIVERIES = 10;
export const COURIER_PAGE_SIZE = 6;
export const ROUTE_NOTE_MARKER = 'Підтверджений маршрут:';
export const ROUTE_META_MARKER = 'Маршрут-дані:';

export type ConfirmedRouteMeta = {
  routeId: number;
  startAddress: string;
  distanceMeters: number | null;
  durationSeconds: number | null;
  geometry?: OptimizedRouteResult['geometry'] | null;
  stop: {
    deliveryId: number;
    order: number;
    toAddress: string;
    resolvedAddress?: string | null;
    lat?: number | null;
    lng?: number | null;
  };
};

export const hasConfirmedRoute = (delivery: CourierDelivery) =>
  Boolean(delivery.notes?.includes(ROUTE_NOTE_MARKER));

const hasStopCoordinates = (meta: ConfirmedRouteMeta) =>
  Number.isFinite(Number(meta.stop.lat)) && Number.isFinite(Number(meta.stop.lng));

export const parseRouteMeta = (delivery: CourierDelivery): ConfirmedRouteMeta | null => {
  const notes = delivery.notes || '';
  const markerIndex = notes.lastIndexOf(ROUTE_META_MARKER);
  if (markerIndex === -1) return null;

  const rawMeta = notes.slice(markerIndex + ROUTE_META_MARKER.length).trim();
  const firstLine = rawMeta.split('\n')[0]?.trim();
  if (!firstLine) return null;

  try {
    return JSON.parse(firstLine) as ConfirmedRouteMeta;
  } catch {
    return null;
  }
};

export const getRouteOrder = (delivery: CourierDelivery) => {
  const meta = parseRouteMeta(delivery);
  if (meta?.stop.order) return meta.stop.order;

  const match = delivery.notes?.match(/Порядок:\s*(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

export const buildConfirmedRoute = (deliveries: CourierDelivery[]): OptimizedRouteResult | null => {
  const routeItems = deliveries
    .map((delivery) => ({ delivery, meta: parseRouteMeta(delivery) }))
    .filter((item): item is { delivery: CourierDelivery; meta: ConfirmedRouteMeta } =>
      Boolean(item.meta && hasStopCoordinates(item.meta))
    )
    .sort((left, right) => left.meta.stop.order - right.meta.stop.order);

  if (routeItems.length === 0) return null;

  const routeMeta = routeItems[0].meta;
  const fallbackCoordinates = routeItems.map(({ meta }) => [
    Number(meta.stop.lng),
    Number(meta.stop.lat),
  ] as [number, number]);
  const geometry = routeMeta.geometry?.coordinates?.length
    ? routeMeta.geometry
    : { type: 'LineString' as const, coordinates: fallbackCoordinates };
  const [startLng, startLat] = geometry.coordinates[0] || fallbackCoordinates[0];

  return {
    start: {
      address: routeMeta.startAddress,
      lat: Number(startLat),
      lng: Number(startLng),
    },
    distanceMeters: Number(routeMeta.distanceMeters || 0),
    durationSeconds: Number(routeMeta.durationSeconds || 0),
    geometry,
    orderedDeliveries: routeItems.map(({ delivery, meta }) => ({
      order: meta.stop.order,
      id: delivery.id,
      shipmentId: delivery.shipment_id,
      trackingNumber: delivery.tracking_number,
      toAddress: meta.stop.toAddress || delivery.to_address,
      resolvedAddress: meta.stop.resolvedAddress || delivery.to_address,
      lat: Number(meta.stop.lat),
      lng: Number(meta.stop.lng),
    })),
  };
};

export const isCourierShipmentAssignable = (shipment: ReadyForCourierShipment) =>
  shipment.status === 'ready_for_pickup'
  && shipment.current_dept_id !== null
  && Number(shipment.current_dept_id) === Number(shipment.dest_dept_id);

export const getCourierShipmentReadiness = (shipment: ReadyForCourierShipment) => {
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
