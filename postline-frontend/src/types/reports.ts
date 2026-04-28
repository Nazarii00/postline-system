export type ReportShipment = {
  id: number;
  tracking_number: string;
  status: string;
  shipment_type: string;
  weight_kg?: number | string;
  sender_name?: string;
  receiver_name?: string;
  origin_city?: string;
  dest_city?: string;
  total_cost: number | string;
  created_at: string;
};

export type RevenueChartPoint = {
  label: string;
  height: number;
};

export type ReportMetrics = {
  totalRevenue: number;
  averageCheck: number;
  shipmentCount: number;
  chart: RevenueChartPoint[];
};

export type ReportFilters = {
  dateFrom: string | null;
  dateTo: string | null;
  status: string | null;
  shipmentType: string | null;
  departmentId: number | null;
  cityFrom: string | null;
  cityTo: string | null;
};

export type ReportSummary = {
  shipment_count: number;
  total_revenue: number;
  average_check: number;
  total_weight_kg: number;
  courier_shipments: number;
  delivered_count: number;
  returned_count: number;
  cancelled_count: number;
  active_count: number;
  failed_courier_attempts: number;
  delivery_rate: number;
  average_delivery_hours: number;
};

export type RevenueByDayPoint = {
  day: string;
  shipments: number;
  revenue: number;
  delivered: number;
};

export type StatusBreakdownItem = {
  status: string;
  count: number;
  revenue: number;
};

export type TypeBreakdownItem = {
  shipment_type: string;
  count: number;
  revenue: number;
  weight_kg: number;
};

export type DepartmentBreakdownItem = {
  department_id: number | null;
  city: string | null;
  address: string | null;
  shipments: number;
  revenue: number;
  delivered: number;
  ready_for_pickup: number;
  courier_shipments: number;
};

export type RouteBreakdownItem = {
  origin_city: string;
  dest_city: string;
  shipments: number;
  revenue: number;
  average_cost: number;
};

export type CourierBreakdownItem = {
  courier_id: number | null;
  courier_name: string | null;
  department_city: string | null;
  assigned: number;
  in_progress: number;
  delivered: number;
  failed: number;
  success_rate: number;
};

export type OverviewReport = {
  filters: ReportFilters;
  summary: ReportSummary;
  revenueByDay: RevenueByDayPoint[];
  statusBreakdown: StatusBreakdownItem[];
  typeBreakdown: TypeBreakdownItem[];
  departmentBreakdown: DepartmentBreakdownItem[];
  routeBreakdown: RouteBreakdownItem[];
  courierBreakdown: CourierBreakdownItem[];
  recentShipments: ReportShipment[];
};
