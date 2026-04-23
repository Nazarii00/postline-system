import { ArrowRight, Clock3, MapPin, Package, TrendingUp, Users } from "lucide-react";

const OverviewPage = () => {
  const isLoading = false;
  const stats = [
    {
      title: "Всього відправлень",
      value: "1 248",
      description: "+34 за сьогодні",
      icon: <Package size={20} className="text-pine" />,
    },
    {
      title: "Активних у дорозі",
      value: "86",
      description: "Оновлено 2 хв тому",
      icon: <TrendingUp size={20} className="text-pine" />,
    },
    {
      title: "Операторів у системі",
      value: "12",
      description: "3 відділення онлайн",
      icon: <Users size={20} className="text-pine" />,
    },
    {
      title: "Звернень у роботі",
      value: "4",
      description: "Потребують підтвердження",
      icon: <Clock3 size={20} className="text-pine" />,
    },
  ];

  const activities = [
    { id: "PL-2026-00451", text: "Статус змінено на «Прийнято»", actor: "Іваненко О.", time: "14:21" },
    { id: "PL-2026-00452", text: "Створено нову накладну", actor: "Петренко Т.", time: "14:09" },
    { id: "PL-2026-00453", text: "Підтверджено видачу", actor: "Сидоренко М.", time: "13:42" },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="space-y-3 min-h-[104px] flex flex-col justify-end">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Огляд системи</h1>
          <p className="text-lg text-slate-500">Ключові показники, активність і стан мережі PostLine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <article key={stat.title} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[190px] flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-pine/10 flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <p className="text-sm text-slate-500">{stat.title}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight mt-2">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-2 mt-auto pt-2">{stat.description}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <article className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock3 size={18} className="text-pine" />
                Остання активність
              </h2>
              <button className="text-sm font-semibold text-pine hover:text-pine/80 transition-colors">Відкрити журнал</button>
            </div>
            {isLoading ? (
              <div className="p-6 text-sm text-slate-500">Завантаження активності...</div>
            ) : activities.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{activity.id}</p>
                      <p className="text-sm text-slate-600 mt-1">{activity.text}</p>
                      <p className="text-xs text-slate-500 mt-2">{activity.actor}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-sm text-slate-500">Поки що немає нових подій.</div>
            )}
          </article>

          <div className="space-y-5">
            <article className="bg-pine rounded-3xl p-6 text-white shadow-lg">
              <h3 className="text-2xl font-bold">Швидка дія</h3>
              <p className="text-sm text-white/80 mt-2">Створіть нову накладну або відкрийте реєстр операторів.</p>
              <button className="mt-5 w-full bg-white text-pine py-3 rounded-2xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                Створити ТТН <ArrowRight size={18} />
              </button>
            </article>

            <article className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={18} className="text-pine" />
                Стан мережі
              </h3>
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Київ (головний)</span>
                  <span className="text-pine font-semibold">Онлайн</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Львів №1</span>
                  <span className="text-pine font-semibold">Онлайн</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Одеса (порт)</span>
                  <span className="text-slate-500 font-semibold">Планове обслуговування</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OverviewPage;