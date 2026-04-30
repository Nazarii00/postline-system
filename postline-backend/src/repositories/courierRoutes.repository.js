const db = require("../db");

const ROUTE_NOTE_MARKER = "Підтверджений маршрут:";
const ROUTE_META_MARKER = "Маршрут-дані:";

const hasRouteMeta = (notes) =>
  Boolean(notes?.includes(ROUTE_META_MARKER));

const parseLegacyRouteNote = (notes = "") => {
  const routeId = notes.match(/Підтверджений маршрут:\s*#?(\d+)/u)?.[1];
  const order = notes.match(/Порядок:\s*(\d+)/u)?.[1];
  const startAddress = notes.match(/Старт:\s*([^;\n]+)/u)?.[1]?.trim();
  const distanceMeters = notes.match(/Дистанція:\s*(\d+)\s*м/u)?.[1];
  const durationSeconds = notes.match(/Тривалість:\s*(\d+)\s*с/u)?.[1];
  const confirmedAt = notes.match(/Підтверджено:\s*([^;\n]+)/u)?.[1]?.trim();

  if (!routeId || !order || !startAddress) return null;

  return {
    routeId: Number(routeId),
    order: Number(order),
    startAddress,
    distanceMeters: distanceMeters ? Number(distanceMeters) : null,
    durationSeconds: durationSeconds ? Number(durationSeconds) : null,
    confirmedAt: confirmedAt || null,
  };
};

const fetchDeliveriesForRoute = (deliveryIds) =>
  db.many(
    `SELECT cd.id,
            cd.courier_id,
            cd.status,
            cd.notes,
            cd.to_address,
            cd.shipment_id,
            s.tracking_number,
            s.current_dept_id,
            s.dest_dept_id,
            dest_dept.city AS dest_city,
            courier_dept.city AS courier_city
     FROM courier_deliveries cd
     JOIN shipments s ON s.id = cd.shipment_id
     JOIN departments dest_dept ON dest_dept.id = s.dest_dept_id
     JOIN users courier ON courier.id = cd.courier_id
     LEFT JOIN departments courier_dept ON courier_dept.id = courier.department_id
     WHERE cd.id = ANY($1::int[])`,
    [deliveryIds]
  );

const createConfirmedCourierRoute = ({
  courierId,
  operatorId,
  startAddress,
  distanceMeters,
  durationSeconds,
  geometry,
  stops,
}) =>
  db.tx(async (client) => {
    const routeId = Date.now();
    const confirmedAt = new Date().toISOString();
    const savedStops = [];
    const routeMeta = {
      routeId,
      courierId,
      operatorId: operatorId || null,
      startAddress,
      distanceMeters: distanceMeters || null,
      durationSeconds: durationSeconds || null,
      confirmedAt,
      geometry: geometry || null,
    };

    for (const stop of stops) {
      const stopMeta = {
        ...routeMeta,
        stop: {
          deliveryId: stop.deliveryId,
          order: stop.order,
          toAddress: stop.toAddress,
          resolvedAddress: stop.resolvedAddress || null,
          lat: stop.lat ?? null,
          lng: stop.lng ?? null,
        },
      };
      const note = [
        `${ROUTE_NOTE_MARKER} #${routeId}`,
        `Порядок: ${stop.order}`,
        `Старт: ${startAddress}`,
        distanceMeters ? `Дистанція: ${distanceMeters} м` : null,
        durationSeconds ? `Тривалість: ${durationSeconds} с` : null,
        `Підтверджено: ${confirmedAt}`,
        `${ROUTE_META_MARKER} ${JSON.stringify(stopMeta)}`,
      ].filter(Boolean).join("; ");

      const { rows: [updatedDelivery] } = await client.query(
        `UPDATE courier_deliveries
         SET notes = CONCAT_WS(E'\n', NULLIF(notes, ''), $2::text)
         WHERE id = $1
         RETURNING id, shipment_id, to_address, notes`,
        [stop.deliveryId, note]
      );

      savedStops.push({
        id: updatedDelivery.id,
        route_id: routeId,
        courier_delivery_id: updatedDelivery.id,
        shipment_id: updatedDelivery.shipment_id,
        stop_order: stop.order,
        to_address: updatedDelivery.to_address,
        resolved_address: stop.resolvedAddress || null,
        lat: stop.lat ?? null,
        lng: stop.lng ?? null,
      });
    }

    return {
      id: routeId,
      courier_id: courierId,
      operator_id: operatorId || null,
      start_address: startAddress,
      distance_meters: distanceMeters || null,
      duration_seconds: durationSeconds || null,
      confirmed_at: confirmedAt,
      stops: savedStops,
    };
  });

const listConfirmedRouteDeliveriesByRouteId = (routeId) =>
  db.many(
    `SELECT cd.id,
            cd.courier_id,
            cd.operator_id,
            cd.status,
            cd.notes,
            cd.to_address,
            cd.shipment_id,
            s.tracking_number,
            s.current_dept_id,
            s.dest_dept_id,
            dest_dept.city AS dest_city,
            courier_dept.city AS courier_city
     FROM courier_deliveries cd
     JOIN shipments s ON s.id = cd.shipment_id
     JOIN departments dest_dept ON dest_dept.id = s.dest_dept_id
     JOIN users courier ON courier.id = cd.courier_id
     LEFT JOIN departments courier_dept ON courier_dept.id = courier.department_id
     WHERE cd.notes ILIKE '%' || $1::text || '%'
     ORDER BY cd.id`,
    [`${ROUTE_NOTE_MARKER} #${routeId}`]
  );

const findActiveConfirmedRouteForCourier = (courierId) =>
  db.oneOrNone(
    `SELECT cd.id,
            cd.shipment_id,
            cd.status,
            cd.notes,
            s.tracking_number
     FROM courier_deliveries cd
     JOIN shipments s ON s.id = cd.shipment_id
     WHERE cd.courier_id = $1
       AND cd.status IN ('assigned', 'in_progress')
       AND cd.notes ILIKE '%' || $2::text || '%'
     ORDER BY cd.attempt_datetime DESC, cd.id DESC
     LIMIT 1`,
    [courierId, ROUTE_NOTE_MARKER]
  );

const appendCourierRouteMeta = ({ deliveryId, meta }) =>
  db.one(
    `UPDATE courier_deliveries
     SET notes = CONCAT_WS(E'\n', NULLIF(notes, ''), $2::text)
     WHERE id = $1
       AND notes NOT ILIKE '%' || $3::text || '%'
     RETURNING id`,
    [deliveryId, `${ROUTE_META_MARKER} ${JSON.stringify(meta)}`, ROUTE_META_MARKER]
  );

module.exports = {
  ROUTE_NOTE_MARKER,
  ROUTE_META_MARKER,
  hasRouteMeta,
  parseLegacyRouteNote,
  fetchDeliveriesForRoute,
  createConfirmedCourierRoute,
  listConfirmedRouteDeliveriesByRouteId,
  findActiveConfirmedRouteForCourier,
  appendCourierRouteMeta,
};
