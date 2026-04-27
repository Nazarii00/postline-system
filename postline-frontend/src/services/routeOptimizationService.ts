import { api } from './api';

export type OptimizedDelivery = {
  order: number;
  id: number;
  shipmentId: number;
  trackingNumber: string;
  toAddress: string;
  resolvedAddress: string;
  lat: number;
  lng: number;
};

export type RouteGeometry = {
  type: 'LineString';
  coordinates: [number, number][];
};

export type OptimizedRouteResult = {
  start: {
    address: string;
    lat: number;
    lng: number;
  };
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteGeometry;
  orderedDeliveries: OptimizedDelivery[];
};

type OptimizeCourierRouteParams = {
  courierId: number;
  startAddress: string;
  deliveryIds: number[];
};

export const optimizeCourierRoute = async (params: OptimizeCourierRouteParams) => {
  const response = await api.post<{ data: OptimizedRouteResult }>(
    '/courier-route-optimization/optimize',
    params
  );

  return response.data;
};
