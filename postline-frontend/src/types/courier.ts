export type ReadyForCourierShipment = {
  id: number;
  tracking_number: string;
  status: string;
  current_dept_id: number | null;
  dest_dept_id: number;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  origin_city: string;
  dest_city: string;
  current_city: string | null;
};

export type Courier = {
  id: number;
  full_name: string;
  phone: string;
  role: string;
};

export type CourierDeliveryStatus = 'assigned' | 'in_progress' | 'delivered' | 'failed';

export type CourierDelivery = {
  id: number;
  shipment_id: number;
  courier_id: number | null;
  status: CourierDeliveryStatus;
  notes?: string | null;
  to_address: string;
  tracking_number: string;
  receiver_name: string;
  receiver_phone: string;
  courier_name: string | null;
  failed_attempts?: number | null;
};
