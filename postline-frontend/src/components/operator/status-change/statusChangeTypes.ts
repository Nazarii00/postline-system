export type Shipment = {
  id: number;
  tracking_number: string;
  status: string;
  origin_dept_id: number;
  dest_dept_id: number;
  current_dept_id: number;
  sender_name: string;
  receiver_name: string;
  shipment_type: string;
  weight_kg: string;
  origin_city: string;
  dest_city: string;
};

export type StatusHistoryItem = {
  tracking_number: string;
  newStatus: string;
  time: string;
};
