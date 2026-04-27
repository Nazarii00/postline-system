export type ReportShipment = {
  id: number;
  tracking_number?: string;
  status?: string;
  shipment_type?: string;
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
