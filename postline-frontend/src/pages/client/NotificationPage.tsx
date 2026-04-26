
import { useState } from 'react';
import { Package, Bell, CheckCircle, Clock } from 'lucide-react';

const NotificationsPage = () => {
  // Мокові дані для сповіщень
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Посилка прибула у відділення',
      message: 'Ваше відправлення PL-2024-00128 готове до видачі у Відділенні №3 (м. Київ).',
      time: 'Сьогодні, 14:30',
      isRead: false,
      icon: Package,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      id: 2,
      title: 'Зміна статусу: В дорозі',
      message: 'Відправлення PL-2024-00115 прямує до міста призначення.',
      time: 'Вчора, 09:15',
      isRead: true,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      id: 3,
      title: 'Системне повідомлення',
      message: 'Графік роботи відділень на свята змінено. Деталі за посиланням.',
      time: '12 Червня, 10:00',
      isRead: true,
      icon: Bell,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
            className="text-[13px] font-medium text-slate-500 hover:text-[#1a362d] flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle size={15} /> Позначити як прочитані
          </button>
        </div>

        <div className="space-y-2">
          {notifications.map((note) => (
            <div 
              key={note.id} 
              className={`flex gap-4 p-4 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200
                ${note.isRead ? 'bg-white' : 'bg-slate-50/80'}`}
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
                <div className="w-2 h-2 rounded-full bg-[#1a362d] mt-2 shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;