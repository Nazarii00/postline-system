const {
  LIMITS,
  PATTERNS,
  optionalDateQuery,
  optionalEnumQuery,
  optionalIdQuery,
  optionalTextQuery,
} = require("./common.validators");

const shipmentStatuses = [
  "accepted",
  "sorting",
  "in_transit",
  "arrived",
  "ready_for_pickup",
  "delivered",
  "returned",
  "cancelled",
];

const overviewReportValidation = [
  optionalDateQuery("dateFrom", "Дата від"),
  optionalDateQuery("dateTo", "Дата до"),
  optionalEnumQuery("status", "Статус", shipmentStatuses),
  optionalEnumQuery("shipmentType", "Тип відправлення", ["letter", "parcel", "package"]),
  optionalIdQuery("departmentId", "ID відділення"),
  optionalTextQuery("cityFrom", "Місто відправлення", {
    max: LIMITS.cityMax,
    pattern: PATTERNS.city,
  }),
  optionalTextQuery("cityTo", "Місто призначення", {
    max: LIMITS.cityMax,
    pattern: PATTERNS.city,
  }),
];

module.exports = { overviewReportValidation };
