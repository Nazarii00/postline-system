export type StatusEvent = {
  status_set: string;
  notes: string | null;
  created_at: string;
  department_city: string | null;
  department_address: string | null;
  operator_name: string | null;
};

export type ShipmentDetail = {
  id: number;
  tracking_number: string;
  status: string;
  total_cost: string;
  created_at: string;
  shipment_type: string;
  size_category: string;
  weight_kg: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  declared_value: string | null;
  description: string | null;
  sender_address: string;
  receiver_address: string;
  is_courier: boolean;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  origin_city: string;
  origin_address: string;
  dest_city: string;
  dest_address: string;
  history?: StatusEvent[];
};
