const db = require("../db");

const fetchDeliveriesForRoute = (deliveryIds) =>
  db.many(
    `SELECT cd.id,
            cd.courier_id,
            cd.status,
            cd.route_id,
            cd.to_address,
            cd.shipment_id,
            s.tracking_number,
            s.current_dept_id,
            s.dest_dept_id
     FROM courier_deliveries cd
     JOIN shipments s ON s.id = cd.shipment_id
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
    const { rows: [route] } = await client.query(
      `INSERT INTO courier_routes
       (courier_id, operator_id, start_address, distance_meters, duration_seconds, geometry)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING *`,
      [
        courierId,
        operatorId || null,
        startAddress,
        distanceMeters || null,
        durationSeconds || null,
        JSON.stringify(geometry || null),
      ]
    );

    const savedStops = [];
    for (const stop of stops) {
      const { rows: [savedStop] } = await client.query(
        `INSERT INTO courier_route_stops
         (route_id, courier_delivery_id, stop_order, to_address, resolved_address, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          route.id,
          stop.deliveryId,
          stop.order,
          stop.toAddress,
          stop.resolvedAddress || null,
          stop.lat ?? null,
          stop.lng ?? null,
        ]
      );

      await client.query(
        `UPDATE courier_deliveries
         SET route_id = $1, route_order = $2
         WHERE id = $3`,
        [route.id, stop.order, stop.deliveryId]
      );

      savedStops.push(savedStop);
    }

    return { ...route, stops: savedStops };
  });

module.exports = {
  fetchDeliveriesForRoute,
  createConfirmedCourierRoute,
};
