import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  User,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const ClientLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigation = [
    { name: 'Мої відправлення', path: '/client', icon: <Package size={20} /> },
    { name: 'Відстежити посилку', path: '/client/tracking', icon: <LayoutDashboard size={20} /> },
    { name: 'Сповіщення', path: '/client/notifications', icon: <Bell size={20} /> },
    { name: 'Профіль', path: '/client/profile', icon: <User size={20} /> },
  ];

  const initials =
    user?.fullName
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'PL';

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="h-screen bg-slate-100 flex font-sans text-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-pine/5 via-transparent to-transparent pointer-events-none z-0" />

      <aside className="hidden lg:flex w-72 bg-white/80 backdrop-blur border-r border-slate-200 flex-col z-20 transition-all h-full">
        <div className="p-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pine rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-pine/20">
              P
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">PostLine</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            Особистий кабінет
          </p>
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm group ${
                  isActive ? 'bg-pine/10 text-pine' : 'text-slate-500 hover:text-pine hover:bg-slate-50'
                }`}
              >
                <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm active:scale-95"
          >
            <LogOut size={20} />
            Вийти
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-full">
        <header className="h-20 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 hover:text-pine rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Особистий кабінет <span className="text-slate-300">/</span> <span className="text-pine">Керування</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900 hidden sm:block">{user?.fullName ?? 'Клієнт PostLine'}</span>
              <div className="w-10 h-10 rounded-xl bg-pine/10 border border-pine/20 flex items-center justify-center text-pine font-bold">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 relative p-4 md:p-8 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-md shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center mb-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pine rounded-lg flex items-center justify-center text-white font-black shadow-md shadow-pine/20">
                  P
                </div>
                <span className="font-bold text-lg text-slate-900">PostLine</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-pine hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-colors ${
                      isActive ? 'bg-pine/10 text-pine' : 'text-slate-600 hover:bg-slate-50 hover:text-pine'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-6 border-t border-slate-100 shrink-0">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm active:scale-95"
              >
                <LogOut size={20} />
                Вийти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientLayout;
