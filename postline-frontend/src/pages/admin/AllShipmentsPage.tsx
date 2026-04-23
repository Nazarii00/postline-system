import {
  Search,
  Filter,
  ChevronRight,
  Package,
  MoreHorizontal,
  Calendar
} from 'lucide-react';

const AllShipmentsPage = () => {
  const isLoading = false;
  const shipments = [
    { id: "PL-2026-00120", sender: "Олександр В.", receiver: "Дмитро П.", route: "Львів → Київ", date: "20.04.2026", status: "Доставлено", type: "Посилка" },
    { id: "PL-2026-00121", sender: "Марія К.", receiver: "Анна С.", route: "Київ → Одеса", date: "20.04.2026", status: "В дорозі", type: "Бандероль" },
    { id: "PL-2026-00122", sender: "Ігор М.", receiver: "Олег Т.", route: "Дніпро → Львів", date: "19.04.2026", status: "Очікує", type: "Лист" },
    { id: "PL-2026-00123", sender: "ТОВ 'Вектор'", receiver: "Петро О.", route: "Харків → Київ", date: "19.04.2026", status: "Скасовано", type: "Посилка" },
  ];
  const displayedShipments = shipments;

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Доставлено': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'В дорозі': return 'bg-pine/10 text-pine border-pine/20';
      case 'Очікує': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Скасовано': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 min-h-[104px]">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Реєстр відправлень
            </h1>
            <p className="text-slate-500 text-base mt-2">
              Повний список та історія всіх посилок PostLine
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-pine transition-colors" />
              <input
                type="text"
                placeholder="Номер ТТН, ПІБ або телефон..."
                className="pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:border-pine outline-none shadow-sm transition-all w-full sm:w-96"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm shadow-sm">
              <Filter size={18} />
              <span>Фільтри</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Інформація</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Учасники</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Маршрут / Дата</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-sm text-slate-500 text-center">Завантаження відправлень...</td>
                  </tr>
                ) : displayedShipments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-sm text-slate-500 text-center">Відправлень за обраними умовами не знайдено.</td>
                  </tr>
                ) : displayedShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group cursor-pointer">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-pine/10 flex items-center justify-center text-pine">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 tracking-tight text-base">{s.id}</p>
                          <p className="text-xs font-semibold text-slate-500 uppercase mt-1">{s.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-2.5">
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-slate-300"></span> {s.sender}
                        </p>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-pine"></span> {s.receiver}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">{s.route}</span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" /> {s.date}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusStyle(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreHorizontal size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-pine/20 group-hover:bg-pine/5 group-hover:text-pine transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs font-semibold text-slate-500">Показано 1-4 з 1,248 відправлень</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors cursor-not-allowed">Назад</button>
              <button className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-pine border border-pine/20 rounded-xl bg-pine/5 shadow-sm">1</button>
              <button className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">2</button>
              <button className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Далі</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AllShipmentsPage;