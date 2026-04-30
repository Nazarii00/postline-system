import {
  Bell,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Truck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { NotificationApiItem, NotificationItem } from './notificationTypes';

export const READ_NOTIFICATIONS_KEY = 'postline-read-notifications';
export const NOTIFICATIONS_UPDATED_EVENT = 'postline:notifications-updated';

const defaultView = {
  title: 'Оновлення відправлення',
  icon: Bell,
  color: 'text-slate-600',
  bg: 'bg-slate-100',
};

const statusView: Record<string, { title: string; icon: LucideIcon; color: string; bg: string }> = {
  accepted: {
    title: 'Відправлення прийнято',
    icon: Package,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  shipment_accepted: {
    title: 'Відправлення прийнято',
    icon: Package,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  sorting: {
    title: 'Відправлення сортується',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  shipment_sorting: {
    title: 'Відправлення сортується',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  sorted: {
    title: 'Відправлення відсортовано',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  in_transit: {
    title: 'Відправлення в дорозі',
    icon: Truck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  shipment_in_transit: {
    title: 'Відправлення в дорозі',
    icon: Truck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  arrived: {
    title: 'Відправлення прибуло',
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  shipment_arrived: {
    title: 'Відправлення прибуло',
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  ready_for_pickup: {
    title: 'Готове до видачі',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  shipment_ready_for_pickup: {
    title: 'Готове до видачі',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  delivered: {
    title: 'Відправлення доставлено',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  shipment_delivered: {
    title: 'Відправлення доставлено',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  courier_delivery_failed: {
    title: "Невдала кур'єрська доставка",
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
  },
  courier_delivery_assigned: {
    title: "Кур'єра призначено",
    icon: Truck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  returned: {
    title: 'Відправлення повертається',
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
  },
  shipment_returned: {
    title: 'Відправлення повертається',
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
  },
  cancelled: {
    title: 'Відправлення скасовано',
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
  },
  shipment_cancelled: {
    title: 'Відправлення скасовано',
    icon: XCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
  },
  shipment_status_updated: defaultView,
};

export const getStoredReadIds = () => {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
};

export const formatNotificationTime = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (left: Date, right: Date) => left.toDateString() === right.toDateString();
  const time = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  if (isSameDay(date, today)) return `Сьогодні, ${time}`;
  if (isSameDay(date, yesterday)) return `Вчора, ${time}`;

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const notifyNotificationsChanged = () => {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
};

export const mapNotification = (
  notification: NotificationApiItem,
  readIds: string[],
): NotificationItem => {
  const notificationId = String(notification.id);
  const view = statusView[notification.type] ?? statusView[notification.shipment_status] ?? defaultView;

  return {
    id: notificationId,
    shipmentId: notification.shipment_id,
    title: notification.title || view.title,
    message: notification.message,
    time: formatNotificationTime(notification.created_at),
    createdAt: notification.created_at,
    isRead: Boolean(notification.read_at) || readIds.includes(notificationId),
    icon: view.icon,
    color: view.color,
    bg: view.bg,
  };
};
