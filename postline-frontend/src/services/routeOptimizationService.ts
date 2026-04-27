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

type ConfirmCourierRouteStop = {
  deliveryId: number;
  order: number;
  toAddress: string;
  resolvedAddress?: string;
  lat?: number;
  lng?: number;
};

type ConfirmCourierRouteParams = {
  courierId: number;
  startAddress: string;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteGeometry;
  stops: ConfirmCourierRouteStop[];
};

export type ConfirmedCourierRoute = {
  id: number | string;
  courier_id: number;
  operator_id: number | null;
  start_address: string;
  distance_meters: number | null;
  duration_seconds: number | null;
  confirmed_at: string;
};

export const optimizeCourierRoute = async (params: OptimizeCourierRouteParams) => {
  const response = await api.post<{ data: OptimizedRouteResult }>(
    '/courier-route-optimization/optimize',
    params
  );

  return response.data;
};

export const confirmCourierRoute = async (params: ConfirmCourierRouteParams) => {
  const response = await api.post<{ data: ConfirmedCourierRoute; message: string }>(
    '/courier-routes/confirm',
    params
  );

  return response;
};
