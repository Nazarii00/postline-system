import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { api } from '../../services/api';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';

const READ_NOTIFICATIONS_KEY = 'postline-read-notifications';
const NOTIFICATIONS_UPDATED_EVENT = 'postline:notifications-updated';
const NOTIFICATIONS_PER_PAGE = 8;

type NotificationItem = {
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

type NotificationApiItem = {
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

const getStoredReadIds = () => {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
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
  shipment_status_updated: {
    title: 'Оновлення відправлення',
    icon: Bell,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
};

const formatNotificationTime = (value: string) => {
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

const notifyNotificationsChanged = () => {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [apiNotifications, setApiNotifications] = useState<NotificationApiItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>(getStoredReadIds);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<{ data: NotificationApiItem[] }>('/notifications')
      .then((res) => setApiNotifications(res.data || []))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Не вдалося завантажити сповіщення');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(readIds));
  }, [readIds]);

  const notifications = useMemo<NotificationItem[]>(() =>
    apiNotifications
      .map((notification) => {
        const notificationId = String(notification.id);
        const view = statusView[notification.type] ?? statusView[notification.shipment_status] ?? {
          title: 'Оновлення відправлення',
          icon: Bell,
          color: 'text-slate-600',
          bg: 'bg-slate-100',
        };

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
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  [apiNotifications, readIds]);
  const {
    activePage,
    endIndex,
    pageNumbers,
    paginatedItems: paginatedNotifications,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  } = usePagination(notifications, NOTIFICATIONS_PER_PAGE);

  const markAllAsRead = async () => {
    await api.patch('/notifications/read-all', {});
    setReadIds((prev) => Array.from(new Set([...prev, ...notifications.map((note) => note.id)])));
    const now = new Date().toISOString();
    setApiNotifications((prev) => prev.map((note) => ({ ...note, read_at: note.read_at || now })));
    notifyNotificationsChanged();
  };

  const openNotification = async (note: NotificationItem) => {
    await api.patch(`/notifications/${note.id}/read`, {});
    setReadIds((prev) => prev.includes(note.id) ? prev : [...prev, note.id]);
    const now = new Date().toISOString();
    setApiNotifications((prev) =>
      prev.map((item) => item.id === note.id ? { ...item, read_at: item.read_at || now } : item)
    );
    notifyNotificationsChanged();
    navigate(`/client/shipment/${note.shipmentId}`);
  };

  const unreadCount = notifications.filter((note) => !note.isRead).length;

  return (
    <div className="px-4 md:px-8 pb-8 pt-2 md:pt-4 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Сповіщення</h1>
        <p className="text-slate-500 text-sm">Слідкуйте за оновленнями ваших відправлень.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 flex items-center">
            Всі сповіщення
            {unreadCount > 0 && (
              <span className="ml-3 bg-[#1a362d] text-white px-2 py-0.5 rounded-md text-[11px] font-bold">
                {unreadCount} нових
              </span>
            )}
          </h2>
          <button
            onClick={markAllAsRead}
            disabled={notifications.length === 0}
            className="text-[13px] font-medium text-slate-500 hover:text-[#1a362d] flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle size={15} /> Позначити як прочитані
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-sm font-medium text-slate-400">
            Завантаження сповіщень...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Bell size={22} />
            </div>
            <p className="text-sm font-bold text-slate-700">Поки немає сповіщень</p>
            <p className="text-sm text-slate-500 mt-1">Коли з'являться відправлення, їхні оновлення будуть тут.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {paginatedNotifications.map((note) => (
                <button
                  type="button"
                  key={note.id}
                  onClick={() => openNotification(note)}
                  className={`w-full text-left flex gap-4 p-4 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200 ${
                    note.isRead ? 'bg-white' : 'bg-slate-50/80'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${note.bg} ${note.color}`}>
                    <note.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm ${note.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                        {note.title}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap ml-4">{note.time}</span>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{note.message}</p>
                  </div>
                  {!note.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[#1a362d] mt-2 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <Pagination
              activePage={activePage}
              endIndex={endIndex}
              itemLabel="сповіщень"
              onPageChange={setCurrentPage}
              pageNumbers={pageNumbers}
              startIndex={startIndex}
              totalItems={totalItems}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
