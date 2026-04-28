const db = require("../db");

const nullableText = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed !== "all" ? trimmed : null;
};

const nullableInt = (value) => {
  const normalized = Number(value);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
};

const nullableDate = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
};

const nullableEnum = (value, allowedValues) => {
  const normalized = nullableText(value);
  return normalized && allowedValues.includes(normalized) ? normalized : null;
};

const normalizeReportFilters = (filters = {}) => ({
  dateFrom: nullableDate(filters.dateFrom),
  dateTo: nullableDate(filters.dateTo),
  status: nullableEnum(filters.status, [
    "accepted",
    "sorting",
    "in_transit",
    "arrived",
    "ready_for_pickup",
    "delivered",
    "returned",
    "cancelled",
  ]),
  shipmentType: nullableEnum(filters.shipmentType, ["letter", "parcel", "package"]),
  departmentId: nullableInt(filters.departmentId),
  cityFrom: nullableText(filters.cityFrom),
  cityTo: nullableText(filters.cityTo),
});

const getFilterParams = (filters) => [
  filters.dateFrom,
  filters.dateTo,
  filters.status,
  filters.shipmentType,
  filters.departmentId,
  filters.cityFrom,
  filters.cityTo,
];

const shipmentWhereClause = `
  WHERE ($1::date IS NULL OR v.created_at::date >= $1::date)
    AND ($2::date IS NULL OR v.created_at::date <= $2::date)
    AND ($3::shipment_status IS NULL OR v.status = $3::shipment_status)
    AND ($4::shipment_type IS NULL OR v.shipment_type = $4::shipment_type)
    AND ($5::int IS NULL OR v.current_dept_id = $5::int)
    AND ($6::varchar IS NULL OR v.origin_city = $6::varchar)
    AND ($7::varchar IS NULL OR v.dest_city = $7::varchar)
`;

const getReportSummary = (filters) =>
  db.one(
    `SELECT
       COUNT(*)::int AS shipment_count,
       COALESCE(SUM(v.total_cost), 0)::float AS total_revenue,
       COALESCE(AVG(v.total_cost), 0)::float AS average_check,
       COALESCE(SUM(v.weight_kg), 0)::float AS total_weight_kg,
       COUNT(*) FILTER (WHERE v.is_courier)::int AS courier_shipments,
       COUNT(*) FILTER (WHERE v.status = 'delivered')::int AS delivered_count,
       COUNT(*) FILTER (WHERE v.status = 'returned')::int AS returned_count,
       COUNT(*) FILTER (WHERE v.status = 'cancelled')::int AS cancelled_count,
       COUNT(*) FILTER (WHERE v.status NOT IN ('delivered', 'returned', 'cancelled'))::int AS active_count,
       COALESCE(SUM(v.failed_attempts), 0)::int AS failed_courier_attempts,
       COALESCE(
         COUNT(*) FILTER (WHERE v.status = 'delivered')::float * 100 / NULLIF(COUNT(*), 0),
         0
       ) AS delivery_rate,
       COALESCE(AVG(EXTRACT(EPOCH FROM (delivered_event.created_at - v.created_at)) / 3600), 0)::float AS average_delivery_hours
     FROM v_shipment_overview v
     LEFT JOIN LATERAL (
       SELECT pe.created_at
       FROM processing_events pe
       WHERE pe.shipment_id = v.shipment_id AND pe.status_set = 'delivered'
       ORDER BY pe.created_at DESC
       LIMIT 1
     ) delivered_event ON TRUE
     ${shipmentWhereClause}`,
    getFilterParams(filters)
  );

const getRevenueByDay = (filters) =>
  db.many(
    `SELECT
       v.created_at::date AS day,
       COUNT(*)::int AS shipments,
       COALESCE(SUM(v.total_cost), 0)::float AS revenue,
       COUNT(*) FILTER (WHERE v.status = 'delivered')::int AS delivered
     FROM v_shipment_overview v
     ${shipmentWhereClause}
     GROUP BY v.created_at::date
     ORDER BY day ASC`,
    getFilterParams(filters)
  );

const getStatusBreakdown = (filters) =>
  db.many(
    `SELECT
       v.status,
       COUNT(*)::int AS count,
       COALESCE(SUM(v.total_cost), 0)::float AS revenue
     FROM v_shipment_overview v
     ${shipmentWhereClause}
     GROUP BY v.status
     ORDER BY count DESC, v.status ASC`,
    getFilterParams(filters)
  );

const getTypeBreakdown = (filters) =>
  db.many(
    `SELECT
       v.shipment_type,
       COUNT(*)::int AS count,
       COALESCE(SUM(v.total_cost), 0)::float AS revenue,
       COALESCE(SUM(v.weight_kg), 0)::float AS weight_kg
     FROM v_shipment_overview v
     ${shipmentWhereClause}
     GROUP BY v.shipment_type
     ORDER BY count DESC, v.shipment_type ASC`,
    getFilterParams(filters)
  );

const getDepartmentBreakdown = (filters) =>
  db.many(
    `SELECT
       v.current_dept_id AS department_id,
       v.current_city AS city,
       v.current_address AS address,
       COUNT(*)::int AS shipments,
       COALESCE(SUM(v.total_cost), 0)::float AS revenue,
       COUNT(*) FILTER (WHERE v.status = 'delivered')::int AS delivered,
       COUNT(*) FILTER (WHERE v.status = 'ready_for_pickup')::int AS ready_for_pickup,
       COUNT(*) FILTER (WHERE v.is_courier)::int AS courier_shipments
     FROM v_shipment_overview v
     ${shipmentWhereClause}
     GROUP BY v.current_dept_id, v.current_city, v.current_address
     ORDER BY shipments DESC, revenue DESC
     LIMIT 12`,
    getFilterParams(filters)
  );

const getRouteBreakdown = (filters) =>
  db.many(
    `SELECT
       v.origin_city,
       v.dest_city,
       COUNT(*)::int AS shipments,
       COALESCE(SUM(v.total_cost), 0)::float AS revenue,
       COALESCE(AVG(v.total_cost), 0)::float AS average_cost
     FROM v_shipment_overview v
     ${shipmentWhereClause}
     GROUP BY v.origin_city, v.dest_city
     ORDER BY shipments DESC, revenue DESC
     LIMIT 10`,
    getFilterParams(filters)
  );

const getCourierBreakdown = (filters) =>
  db.many(
    `SELECT
       cdv.courier_id,
       cdv.courier_name,
       cdv.courier_city AS department_city,
       COUNT(*) FILTER (WHERE cdv.delivery_status = 'assigned')::int AS assigned,
       COUNT(*) FILTER (WHERE cdv.delivery_status = 'in_progress')::int AS in_progress,
       COUNT(*) FILTER (WHERE cdv.delivery_status = 'delivered')::int AS delivered,
       COUNT(*) FILTER (WHERE cdv.delivery_status = 'failed')::int AS failed,
       COALESCE(
         COUNT(*) FILTER (WHERE cdv.delivery_status = 'delivered')::float * 100
         / NULLIF(COUNT(*) FILTER (WHERE cdv.delivery_status IN ('delivered', 'failed')), 0),
         0
       ) AS success_rate
     FROM v_courier_delivery_overview cdv
     JOIN v_shipment_overview v ON v.shipment_id = cdv.shipment_id
     ${shipmentWhereClause}
     GROUP BY cdv.courier_id, cdv.courier_name, cdv.courier_city
     ORDER BY delivered DESC, assigned DESC, failed DESC
     LIMIT 10`,
    getFilterParams(filters)
  );

const getRecentShipments = (filters) =>
  db.many(
    `SELECT
       v.shipment_id AS id,
       v.tracking_number,
       v.status,
       v.total_cost,
       v.created_at,
       v.shipment_type,
       v.weight_kg,
       v.sender_name,
       v.receiver_name,
       v.origin_city,
       v.dest_city
     FROM v_shipment_overview v
     ${shipmentWhereClause}
     ORDER BY v.created_at DESC
     LIMIT 12`,
    getFilterParams(filters)
  );

const getOverviewReport = async (rawFilters = {}) => {
  const filters = normalizeReportFilters(rawFilters);
  const [
    summary,
    revenueByDay,
    statusBreakdown,
    typeBreakdown,
    departmentBreakdown,
    routeBreakdown,
    courierBreakdown,
    recentShipments,
  ] = await Promise.all([
    getReportSummary(filters),
    getRevenueByDay(filters),
    getStatusBreakdown(filters),
    getTypeBreakdown(filters),
    getDepartmentBreakdown(filters),
    getRouteBreakdown(filters),
    getCourierBreakdown(filters),
    getRecentShipments(filters),
  ]);

  return {
    filters,
    summary,
    revenueByDay,
    statusBreakdown,
    typeBreakdown,
    departmentBreakdown,
    routeBreakdown,
    courierBreakdown,
    recentShipments,
  };
};

module.exports = {
  getOverviewReport,
};
