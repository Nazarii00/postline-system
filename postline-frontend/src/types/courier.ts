export type ReadyForCourierShipment = {
  id: number;
  tracking_number: string;
  status: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  dest_city: string;
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
  to_address: string;
  tracking_number: string;
  receiver_name: string;
  receiver_phone: string;
  courier_name: string | null;
};
