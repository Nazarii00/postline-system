export type ShipmentStatus = 
  | 'accepted' | 'sorting' | 'in_transit' 
  | 'arrived' | 'ready_for_pickup' | 'delivered' 
  | 'returned' | 'cancelled';

export type Shipment = {
  id: number;
  tracking_number: string;
  status: ShipmentStatus;
  total_cost: number;
  created_at: string;
  shipment_type: string;
  weight_kg: number;
  sender_name: string;
  receiver_name: string;
  origin_city: string;
  dest_city: string;
};