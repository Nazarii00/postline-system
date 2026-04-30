const db = require('../db');
const crypto = require('crypto');
const { createShipmentStatusNotifications } = require("./notifications.repository");

const generateTrackingNumber = () =>
  'PL' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();

const nullableText = (value) => {
  if (typeof value !== 'string') return value || null;
  const trimmed = value.trim();
  return trimmed || null;
};

const nullableDate = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
};

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const formatDepartmentAddress = (city, address) =>
  [city, address].filter(Boolean).join(", ");

const ensureProcessingEvent = async (client, {
  shipmentId,
  departmentId,
  operatorId,
  status,
  notes = null,
}) => {
  const { rows: [existingEvent] } = await client.query(
    `SELECT id
     FROM processing_events
     WHERE shipment_id = $1
       AND status_set = $2
       AND (
         department_id IS NOT DISTINCT FROM $3::int
         OR created_at >= NOW() - INTERVAL '10 seconds'
       )
     ORDER BY (department_id IS NOT DISTINCT FROM $3::int) DESC,
              created_at DESC,
              id DESC
     LIMIT 1`,
    [shipmentId, status, departmentId || null]
  );

  if (existingEvent) {
    if (notes) {
      await client.query(
        `UPDATE processing_events
         SET notes = $1
         WHERE id = $2`,
        [notes, existingEvent.id]
      );
    }

    return existingEvent;
  }

  const { rows: [createdEvent] } = await client.query(
    `INSERT INTO processing_events
       (shipment_id, department_id, operator_id, status_set, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [shipmentId, departmentId || null, operatorId || null, status, notes || null]
  );

  return createdEvent;
};

const SORT_COLUMNS = {
  id: 's.id',
  tracking_number: 's.tracking_number',
  trackingNumber: 's.tracking_number',
  status: 's.status',
  total_cost: 's.total_cost',
  totalCost: 's.total_cost',
  created_at: 's.created_at',
  createdAt: 's.created_at',
  current_dept_id: 's.current_dept_id',
  shipment_type: 'sd.shipment_type',
  shipmentType: 'sd.shipment_type',
  weight_kg: 'sd.weight_kg',
  weightKg: 'sd.weight_kg',
  sender_name: 'LOWER(sender.full_name)',
  senderName: 'LOWER(sender.full_name)',
  receiver_name: 'LOWER(receiver.full_name)',
  receiverName: 'LOWER(receiver.full_name)',
  origin_city: 'LOWER(origin.city)',
  originCity: 'LOWER(origin.city)',
  dest_city: 'LOWER(dest.city)',
  destCity: 'LOWER(dest.city)',
};

const buildShipmentOrderBy = ({ sortBy, sortOrder } = {}) => {
  const column = SORT_COLUMNS[sortBy] || SORT_COLUMNS.created_at;
  const direction = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const fallbackDirection = direction === 'ASC' ? 'ASC' : 'DESC';

  return `ORDER BY ${column} ${direction}, s.id ${fallbackDirection}`;
};

const normalizeShipmentFilters = ({
  status,
  trackingNumber,
  clientName,
  dateFrom,
  dateTo,
  search,
  sortBy,
  sortOrder,
} = {}) => ({
  status: nullableText(status),
  trackingNumber: nullableText(trackingNumber),
  clientName: nullableText(clientName),
  dateFrom: nullableDate(dateFrom),
  dateTo: nullableDate(dateTo),
  search: nullableText(search),
  orderBy: buildShipmentOrderBy({ sortBy, sortOrder }),
});

// Пише в shipments + shipment_details в одній транзакції
const createShipment = ({
  senderId, receiverId,
  originDeptId, destDeptId,
  tariffId, routeId,
  shipmentType, sizeCategory,
  weightKg, lengthCm, widthCm, heightCm,
  declaredValue, description,
  senderAddress, receiverAddress,
  operatorId,
  isCourier,
}) =>
  db.tx(async (client) => {
    if (operatorId) {
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(operatorId)]);
    }

    // Беремо тариф для розрахунку вартості
    const { rows: [tariff] } = await client.query(
      'SELECT * FROM tariffs WHERE id = $1 AND deleted_at IS NULL', [tariffId]
    );
    if (!tariff) throw new Error('Тариф не знайдено');

    const { rows: [departments] } = await client.query(
      `SELECT origin.city AS origin_city,
              origin.address AS origin_address,
              dest.city AS dest_city,
              dest.address AS dest_address
       FROM departments origin
       JOIN departments dest ON dest.id = $2
       WHERE origin.id = $1`,
      [originDeptId, destDeptId]
    );
    if (!departments) throw createError(400, "Відділення відправки або призначення не знайдено");

    const tariffMatchesShipment =
      tariff.city_from === departments.origin_city
      && tariff.city_to === departments.dest_city
      && tariff.shipment_type === shipmentType
      && tariff.size_category === sizeCategory;

    if (!tariffMatchesShipment) {
      throw createError(400, "Обраний тариф не відповідає маршруту, типу або розміру відправлення");
    }

    const declaredValueNum = Number(declaredValue || 0);
    const weightKgNum = Number(weightKg);
    if (isCourier && (tariff.courier_base_fee == null || tariff.courier_fee_per_kg == null)) {
      throw createError(400, "Для цього тарифу не налаштовано вартість кур'єрської доставки");
    }

    const courierBaseFee = Number(tariff.courier_base_fee || 0);
    const courierFeePerKg = Number(tariff.courier_fee_per_kg || 0);
    const courierPrice = isCourier ? courierBaseFee + courierFeePerKg * weightKgNum : 0;
    const insurance = declaredValueNum > 500 ? Math.round(declaredValueNum * 0.005) : 0;
    const totalCost = parseFloat(tariff.base_price) + parseFloat(tariff.price_per_kg) * weightKgNum + courierPrice + insurance;
    const trackingNumber = generateTrackingNumber();

    const { rows: [shipment] } = await client.query(
      `INSERT INTO shipments
       (tracking_number, sender_id, receiver_id, origin_dept_id, dest_dept_id,
        current_dept_id, tariff_id, route_id, total_cost)
       VALUES ($1, $2, $3, $4, $5, $4, $6, $7, $8)
       RETURNING *`,
      [trackingNumber, senderId, receiverId, originDeptId, destDeptId, tariffId, routeId || null, totalCost]
    );

    await client.query(
      `INSERT INTO shipment_details
       (shipment_id, shipment_type, size_category, weight_kg,
        length_cm, width_cm, height_cm, declared_value, description,
        sender_address, receiver_address, is_courier)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [shipment.id, shipmentType, sizeCategory, weightKg,
       lengthCm, widthCm, heightCm, declaredValue || null, description || null,
       senderAddress || formatDepartmentAddress(departments.origin_city, departments.origin_address),
       receiverAddress || formatDepartmentAddress(departments.dest_city, departments.dest_address),
       isCourier]
    );

    await ensureProcessingEvent(client, {
      shipmentId: shipment.id,
      departmentId: originDeptId,
      operatorId,
      status: "accepted",
    });
    await createShipmentStatusNotifications(client, shipment, "accepted");

    return shipment;
  });

// Повна інформація з деталями і хронологією
const getShipmentById = (id) =>
  db.one(
    `SELECT s.*,
            sd.shipment_type, sd.size_category, sd.weight_kg,
            sd.length_cm, sd.width_cm, sd.height_cm,
            sd.declared_value, sd.description,
            sd.sender_address, sd.receiver_address, sd.is_courier,
            sender.full_name   AS sender_name,
            sender.phone       AS sender_phone,
            receiver.full_name AS receiver_name,
            receiver.phone     AS receiver_phone,
            origin.city        AS origin_city,
            origin.address     AS origin_address,
            dest.city          AS dest_city,
            dest.address       AS dest_address
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN users sender         ON sender.id = s.sender_id
     JOIN users receiver       ON receiver.id = s.receiver_id
     JOIN departments origin   ON origin.id = s.origin_dept_id
     JOIN departments dest     ON dest.id = s.dest_dept_id
     WHERE s.id = $1`,
    [id]
  );

const getShipmentByTracking = (trackingNumber) =>
  db.one(
    `SELECT s.*,
            sd.shipment_type, sd.weight_kg, sd.is_courier,
            sd.sender_address, sd.receiver_address,
            origin.city AS origin_city,
            dest.city   AS dest_city
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN departments origin  ON origin.id = s.origin_dept_id
     JOIN departments dest    ON dest.id = s.dest_dept_id
     WHERE s.tracking_number = $1`,
    [trackingNumber]
  );

const getShipmentsByClient = (clientId, filters = {}) => {
  const {
    status,
    trackingNumber,
    clientName,
    dateFrom,
    dateTo,
    search,
    orderBy,
  } = normalizeShipmentFilters(filters);

  return db.many(
    `SELECT s.id, s.tracking_number, s.status, s.total_cost, s.created_at, s.current_dept_id,
            sd.shipment_type, sd.weight_kg,
            sender.full_name   AS sender_name,
            receiver.full_name AS receiver_name,
            origin.city AS origin_city,
            dest.city   AS dest_city
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN users sender        ON sender.id = s.sender_id
     JOIN users receiver      ON receiver.id = s.receiver_id
     JOIN departments origin  ON origin.id = s.origin_dept_id
     JOIN departments dest    ON dest.id = s.dest_dept_id
     WHERE (s.sender_id = $1 OR s.receiver_id = $1)
       AND ($2::shipment_status IS NULL OR s.status = $2::shipment_status)
       AND ($3::varchar IS NULL OR s.tracking_number ILIKE '%' || $3 || '%')
       AND (
         $4::varchar IS NULL
         OR sender.full_name ILIKE '%' || $4 || '%'
         OR receiver.full_name ILIKE '%' || $4 || '%'
       )
       AND ($5::date IS NULL OR s.created_at::date >= $5::date)
       AND ($6::date IS NULL OR s.created_at::date <= $6::date)
       AND (
         $7::varchar IS NULL
         OR s.tracking_number ILIKE '%' || $7 || '%'
         OR sender.full_name ILIKE '%' || $7 || '%'
         OR receiver.full_name ILIKE '%' || $7 || '%'
         OR to_char(s.created_at::date, 'YYYY-MM-DD') ILIKE '%' || $7 || '%'
         OR to_char(s.created_at, 'DD.MM.YYYY') ILIKE '%' || $7 || '%'
       )
     ${orderBy}`,
    [clientId, status, trackingNumber, clientName, dateFrom, dateTo, search]
  );
};

const getShipmentsByDepartment = (departmentId, filters = {}) => {
  const {
    status,
    trackingNumber,
    clientName,
    dateFrom,
    dateTo,
    search,
    orderBy,
  } = normalizeShipmentFilters(filters);

  return db.many(
    `SELECT s.id, s.tracking_number, s.status, s.total_cost, s.created_at,
            s.origin_dept_id, s.dest_dept_id, s.current_dept_id,
            sd.shipment_type, sd.weight_kg, sd.receiver_address,
            sender.full_name   AS sender_name,
            receiver.full_name AS receiver_name,
            receiver.phone     AS receiver_phone,
            origin.city        AS origin_city,
            dest.city          AS dest_city
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN users sender        ON sender.id = s.sender_id
     JOIN users receiver      ON receiver.id = s.receiver_id
     JOIN departments origin   ON origin.id = s.origin_dept_id
     JOIN departments dest     ON dest.id = s.dest_dept_id
     WHERE s.current_dept_id = $1
       AND ($2::shipment_status IS NULL OR s.status = $2::shipment_status)
       AND ($3::varchar IS NULL OR s.tracking_number ILIKE '%' || $3 || '%')
       AND (
         $4::varchar IS NULL
         OR sender.full_name ILIKE '%' || $4 || '%'
         OR receiver.full_name ILIKE '%' || $4 || '%'
       )
       AND ($5::date IS NULL OR s.created_at::date >= $5::date)
       AND ($6::date IS NULL OR s.created_at::date <= $6::date)
       AND (
         $7::varchar IS NULL
         OR s.tracking_number ILIKE '%' || $7 || '%'
         OR sender.full_name ILIKE '%' || $7 || '%'
         OR receiver.full_name ILIKE '%' || $7 || '%'
         OR to_char(s.created_at::date, 'YYYY-MM-DD') ILIKE '%' || $7 || '%'
         OR to_char(s.created_at, 'DD.MM.YYYY') ILIKE '%' || $7 || '%'
       )
     ${orderBy}`,
    [departmentId, status, trackingNumber, clientName, dateFrom, dateTo, search]
  );
};

const getCourierShipmentsForCurrentDepartment = (departmentId, { trackingNumber } = {}) =>
  db.many(
    `SELECT s.id, s.tracking_number, s.status, s.total_cost, s.created_at,
            s.origin_dept_id, s.dest_dept_id, s.current_dept_id,
            sd.shipment_type, sd.weight_kg, sd.receiver_address, sd.is_courier,
            sender.full_name   AS sender_name,
            receiver.full_name AS receiver_name,
            receiver.phone     AS receiver_phone,
            origin.city        AS origin_city,
            dest.city          AS dest_city,
            current.city       AS current_city
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN users sender        ON sender.id = s.sender_id
     JOIN users receiver      ON receiver.id = s.receiver_id
     JOIN departments origin   ON origin.id = s.origin_dept_id
     JOIN departments dest     ON dest.id = s.dest_dept_id
     LEFT JOIN departments current ON current.id = s.current_dept_id
     WHERE s.current_dept_id = $1
       AND s.dest_dept_id = $1
       AND sd.is_courier = TRUE
       AND COALESCE(s.failed_attempts, 0) < 3
       AND s.status NOT IN ('delivered', 'cancelled', 'returned')
       AND ($2::varchar IS NULL OR s.tracking_number ILIKE '%' || $2 || '%')
       AND NOT EXISTS (
         SELECT 1
         FROM courier_deliveries cd
         WHERE cd.shipment_id = s.id
           AND cd.status IN ('assigned', 'in_progress', 'delivered')
       )
     ORDER BY (s.status = 'ready_for_pickup') DESC,
              s.created_at DESC`,
    [departmentId, trackingNumber || null]
  );

const getAllShipments = (filters = {}) => {
  const {
    departmentId,
    status,
    trackingNumber,
    clientName,
    dateFrom,
    dateTo,
    search,
    orderBy,
  } = {
    departmentId: filters.departmentId || null,
    ...normalizeShipmentFilters(filters),
  };

  return db.many(
    `SELECT s.id, s.tracking_number, s.status, s.total_cost, s.created_at, s.current_dept_id,
            sd.shipment_type, sd.weight_kg,
            sender.full_name   AS sender_name,
            receiver.full_name AS receiver_name,
            origin.city        AS origin_city,
            dest.city          AS dest_city
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN users sender        ON sender.id = s.sender_id
     JOIN users receiver      ON receiver.id = s.receiver_id
     JOIN departments origin  ON origin.id = s.origin_dept_id
     JOIN departments dest    ON dest.id = s.dest_dept_id
     WHERE ($1::int IS NULL OR s.current_dept_id = $1)
       AND ($2::shipment_status IS NULL OR s.status = $2::shipment_status)
       AND ($3::varchar IS NULL OR s.tracking_number ILIKE '%' || $3 || '%')
       AND (
         $4::varchar IS NULL
         OR sender.full_name ILIKE '%' || $4 || '%'
         OR receiver.full_name ILIKE '%' || $4 || '%'
       )
       AND ($5::date IS NULL OR s.created_at::date >= $5::date)
       AND ($6::date IS NULL OR s.created_at::date <= $6::date)
       AND (
         $7::varchar IS NULL
         OR s.tracking_number ILIKE '%' || $7 || '%'
         OR sender.full_name ILIKE '%' || $7 || '%'
         OR receiver.full_name ILIKE '%' || $7 || '%'
         OR to_char(s.created_at::date, 'YYYY-MM-DD') ILIKE '%' || $7 || '%'
         OR to_char(s.created_at, 'DD.MM.YYYY') ILIKE '%' || $7 || '%'
       )
     ${orderBy}`,
    [departmentId, status, trackingNumber, clientName, dateFrom, dateTo, search]
  );
};

// app.current_user_id потрібен для тригера fn_log_status_change
const changeShipmentStatus = (id, {
  status,
  operatorId,
  departmentId,
  currentDeptId,
  eventDepartmentId,
  notes,
  extraEvents = [],
}) =>
  db.tx(async (client) => {
    if (operatorId) {
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(operatorId)]);
    }

    for (const event of extraEvents) {
      await ensureProcessingEvent(client, {
        shipmentId: id,
        departmentId: event.departmentId,
        operatorId,
        status: event.status,
        notes: event.notes,
      });
    }

    const nextCurrentDeptId = currentDeptId || departmentId;
    const processingDepartmentId = eventDepartmentId || nextCurrentDeptId;

    const { rows: [updated] } = await client.query(
      `UPDATE shipments
       SET status = $2, current_dept_id = $3
       WHERE id = $1
       RETURNING *`,
      [id, status, nextCurrentDeptId]
    );

    if (updated) {
      await ensureProcessingEvent(client, {
        shipmentId: updated.id,
        departmentId: processingDepartmentId,
        operatorId,
        status,
        notes,
      });
      await createShipmentStatusNotifications(client, updated, status);
    }

    return updated;
  });

const cancelShipment = (id, { operatorId, departmentId } = {}) =>
  db.tx(async (client) => {
    if (operatorId) {
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(operatorId)]);
    }

    const { rows: [updated] } = await client.query(
      `UPDATE shipments SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (updated) {
      await ensureProcessingEvent(client, {
        shipmentId: updated.id,
        departmentId: departmentId || updated.current_dept_id,
        operatorId,
        status: "cancelled",
      });
      await createShipmentStatusNotifications(client, updated, "cancelled");
    }

    return updated || null;
  });

// Хронологія змін статусів
const getShipmentHistory = (shipmentId) =>
  db.many(
    `SELECT pe.status_set, pe.notes, pe.created_at,
            d.city    AS department_city,
            d.address AS department_address,
            u.full_name AS operator_name
     FROM processing_events pe
     LEFT JOIN departments d ON d.id = pe.department_id
     LEFT JOIN users u       ON u.id = pe.operator_id
     WHERE pe.shipment_id = $1
     ORDER BY pe.created_at ASC`,
    [shipmentId]
  );

const getRecentActivity = async (limit = 10) => {
  // Використовуємо параметризований запит ($1) для безпеки та гнучкості
  return db.many(
    `SELECT s.tracking_number, pe.status_set, pe.created_at,
            u.full_name AS operator_name
     FROM processing_events pe
     JOIN shipments s ON s.id = pe.shipment_id
     LEFT JOIN users u ON u.id = pe.operator_id
     ORDER BY pe.created_at DESC
     LIMIT $1`,
    [limit]
  );
};

module.exports = {
  createShipment,
  getShipmentById,
  getShipmentByTracking,
  getShipmentsByClient,
  getShipmentsByDepartment,
  getCourierShipmentsForCurrentDepartment,
  getAllShipments,
  changeShipmentStatus,
  cancelShipment,
  getShipmentHistory,
  getRecentActivity,
};
