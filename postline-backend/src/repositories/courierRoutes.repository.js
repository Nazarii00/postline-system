const db = require("../db");

const ROUTE_NOTE_MARKER = "Підтверджений маршрут:";

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
  stops,
}) =>
  db.tx(async (client) => {
    const routeId = Date.now();
    const confirmedAt = new Date().toISOString();
    const savedStops = [];

    for (const stop of stops) {
      const note = [
        `${ROUTE_NOTE_MARKER} #${routeId}`,
        `Порядок: ${stop.order}`,
        `Старт: ${startAddress}`,
        distanceMeters ? `Дистанція: ${distanceMeters} м` : null,
        durationSeconds ? `Тривалість: ${durationSeconds} с` : null,
        `Підтверджено: ${confirmedAt}`,
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

module.exports = {
  ROUTE_NOTE_MARKER,
  fetchDeliveriesForRoute,
  createConfirmedCourierRoute,
};
