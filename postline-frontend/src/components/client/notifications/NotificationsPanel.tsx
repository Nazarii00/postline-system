import { Bell, CheckCircle } from 'lucide-react';
import { Pagination } from '../../ui/Pagination';
import { NotificationListItem } from './NotificationListItem';
import type { NotificationItem } from './notificationTypes';

type NotificationsPanelProps = {
  error: string;
  isLoading: boolean;
  notificationsCount: number;
  unreadCount: number;
  paginatedNotifications: NotificationItem[];
  pagination: {
    activePage: number;
    endIndex: number;
    pageNumbers: (number | string)[];
    setCurrentPage: (page: number) => void;
    startIndex: number;
    totalItems: number;
    totalPages: number;
  };
  onMarkAllAsRead: () => void;
  onOpenNotification: (note: NotificationItem) => void;
};

export const NotificationsPanel = ({
  error,
  isLoading,
  notificationsCount,
  unreadCount,
  paginatedNotifications,
  pagination,
  onMarkAllAsRead,
  onOpenNotification,
}: NotificationsPanelProps) => (
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
        type="button"
        onClick={onMarkAllAsRead}
        disabled={notificationsCount === 0}
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
    ) : notificationsCount === 0 ? (
      <div className="py-12 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <Bell size={22} />
        </div>
        <p className="text-sm font-bold text-slate-700">Поки немає сповіщень</p>
        <p className="text-sm text-slate-500 mt-1">
          Коли з'являться відправлення, їхні оновлення будуть тут.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="space-y-2">
          {paginatedNotifications.map((note) => (
            <NotificationListItem
              key={note.id}
              note={note}
              onOpen={onOpenNotification}
            />
          ))}
        </div>

        <Pagination
          activePage={pagination.activePage}
          endIndex={pagination.endIndex}
          itemLabel="сповіщень"
          onPageChange={pagination.setCurrentPage}
          pageNumbers={pagination.pageNumbers}
          startIndex={pagination.startIndex}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      </div>
    )}
  </div>
);
