export type RouteStop = {
  sequence_order: number;
  distance_from_prev_km: number | null;
  id: number;
  city: string;
  address: string;
};

export type RouteSummary = {
  id: number;
  start_dept_id: number;
  end_dept_id: number;
  distance_km: number | null;
  est_time_hours: number | null;
  start_city: string;
  end_city: string;
  stops?: RouteStop[];
};
