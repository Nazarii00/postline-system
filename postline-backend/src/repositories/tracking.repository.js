const db = require("../db");

class TrackingRepository {
  async getShipmentByTrackingNumber(trackingNumber) {
    const query = `
      SELECT
          s.id, s.tracking_number, s.status, s.total_cost, s.created_at, s.failed_attempts,
          sd.shipment_type, sd.weight_kg, sd.length_cm, sd.width_cm, sd.height_cm,
          sd.declared_value, sd.is_courier, sd.sender_address, sd.receiver_address,
          u_sender.full_name AS sender_name, u_receiver.full_name AS receiver_name,
          dept_origin.city AS origin_city, dept_origin.address AS origin_address,
          dept_dest.city AS dest_city, dept_dest.address AS dest_address
      FROM shipments s
      JOIN shipment_details sd ON s.id = sd.shipment_id
      JOIN users u_sender ON s.sender_id = u_sender.id
      JOIN users u_receiver ON s.receiver_id = u_receiver.id
      JOIN departments dept_origin ON s.origin_dept_id = dept_origin.id
      JOIN departments dept_dest ON s.dest_dept_id = dept_dest.id
      WHERE s.tracking_number = $1
    `;

    return db.one(query, [trackingNumber]);
  }

  async getShipmentHistory(shipmentId) {
    const query = `
      SELECT pe.status_set, pe.created_at, pe.notes, d.city, d.address
      FROM processing_events pe
      LEFT JOIN departments d ON pe.department_id = d.id
      WHERE pe.shipment_id = $1
      ORDER BY pe.created_at ASC
    `;

    return db.many(query, [shipmentId]);
  }
}

module.exports = new TrackingRepository();
