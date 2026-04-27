export type ShipmentStatus =
  | 'accepted'
  | 'sorting'
  | 'in_transit'
  | 'arrived'
  | 'ready_for_pickup'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export type ShipmentType = 'letter' | 'parcel' | 'package' | string;

export type Shipment = {
  id: number;
  tracking_number: string;
  status: ShipmentStatus;
  total_cost: number | string;
  created_at: string;
  current_dept_id?: number;
  shipment_type: ShipmentType;
  weight_kg: number | string;
  sender_name: string;
  receiver_name: string;
  origin_city: string;
  dest_city: string;
};

export interface ShipmentFormData {
  senderPhone: string;
  senderFullName: string;
  senderCity: string;
  senderBranch: string;
  receiverPhone: string;
  receiverFullName: string;
  receiverCity: string;
  receiverBranch: string;
  receiverAddress: string;
  type: string;
  weight: string;
  declaredValue: string;
  length: string;
  width: string;
  height: string;
  description: string;
}

export interface Department {
  id: number;
  city: string;
  address: string;
  type: string;
}

export interface Tariff {
  id: number;
  city_from: string;
  city_to: string;
  shipment_type: string;
  size_category: string;
  base_price: string;
  price_per_kg: string;
}
