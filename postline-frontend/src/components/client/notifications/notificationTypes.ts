import type { LucideIcon } from 'lucide-react';

export type NotificationApiItem = {
  id: string;
  shipment_id: number;
  type: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  tracking_number: string;
  shipment_status: string;
};

export type NotificationItem = {
  id: string;
  shipmentId: number;
  title: string;
  message: string;
  time: string;
  createdAt: string;
  isRead: boolean;
  icon: LucideIcon;
  color: string;
  bg: string;
};
