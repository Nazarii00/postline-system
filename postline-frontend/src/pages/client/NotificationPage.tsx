import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationsPanel } from '../../components/client/notifications/NotificationsPanel';
import type { NotificationApiItem, NotificationItem } from '../../components/client/notifications/notificationTypes';
import {
  getStoredReadIds,
  mapNotification,
  notifyNotificationsChanged,
  READ_NOTIFICATIONS_KEY,
} from '../../components/client/notifications/notificationUtils';
import { usePagination } from '../../hooks/usePagination';
import { api } from '../../services/api';

const NOTIFICATIONS_PER_PAGE = 8;

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
      .map((notification) => mapNotification(notification, readIds))
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
    setApiNotifications((prev) =>
      prev.map((note) => ({ ...note, read_at: note.read_at || now }))
    );
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
        <p className="text-slate-500 text-sm">
          Слідкуйте за оновленнями ваших відправлень.
        </p>
      </div>

      <NotificationsPanel
        error={error}
        isLoading={isLoading}
        notificationsCount={notifications.length}
        unreadCount={unreadCount}
        paginatedNotifications={paginatedNotifications}
        pagination={{
          activePage,
          endIndex,
          pageNumbers,
          setCurrentPage,
          startIndex,
          totalItems,
          totalPages,
        }}
        onMarkAllAsRead={markAllAsRead}
        onOpenNotification={openNotification}
      />
    </div>
  );
};

export default NotificationsPage;
