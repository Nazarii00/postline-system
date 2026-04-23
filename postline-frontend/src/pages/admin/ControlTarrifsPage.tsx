import {
  Plus,
  Settings2,
  Truck,
  Zap,
  Edit3,
  ArrowRightLeft,
  Search,
  PackageCheck
} from 'lucide-react';

const ControlTariffsPage = () => {
  const isLoading = false;
  const tariffs = [
    { id: 1, from: "Львів", to: "Київ", type: "Посилка", size: "Середня", basePrice: "80 грн", perKg: "10 грн" },
    { id: 2, from: "Київ", to: "Харків", type: "Бандероль", size: "Мала", basePrice: "50 грн", perKg: "8 грн" },
    { id: 3, from: "Одеса", to: "Дніпро", type: "Лист", size: "Мала", basePrice: "30 грн", perKg: "5 грн" },
  ];
  const displayedTariffs = tariffs;

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="px-6 md:px-10 max-w-7xl mx-auto w-full py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 min-h-[104px]">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Керування тарифами
            </h1>
            <p className="text-slate-500 text-base mt-2">
              Налаштування вартості доставки та додаткових послуг
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm shadow-sm">
              <Settings2 size={18} />
              <span>Глобальні налаштування</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-pine text-white rounded-2xl font-semibold hover:bg-pine/90 transition-colors shadow-md text-sm whitespace-nowrap">
              <Plus size={18} />
              <span>Додати тариф</span>
            </button>
          </div>
        </div>

        {/* Grid for Quick Settings - Уніфікована палітра (pine/slate) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-5 hover:border-slate-300 transition-all shadow-sm min-h-[124px]">
            <div className="w-14 h-14 bg-pine/5 rounded-2xl flex items-center justify-center text-pine">
              <Truck size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Базовий тариф</p>
              <p className="text-lg font-bold text-slate-900 mt-1">Від 45.00 ₴</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-5 hover:border-slate-300 transition-all shadow-sm min-h-[124px]">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
              <Zap size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Експрес-доплата</p>
              <p className="text-lg font-bold text-slate-900 mt-1">+25% до ціни</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-5 hover:border-slate-300 transition-all shadow-sm min-h-[124px]">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
              <PackageCheck size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Страхування</p>
              <p className="text-lg font-bold text-slate-900 mt-1">0.5% від вартості</p>
            </div>
          </div>
        </div>

        {/* Main Tariffs Table - Відступи та типографіка за еталоном */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md min-w-[280px]">
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input 
                placeholder="Фільтр за містом..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pine focus:bg-white transition-all" 
              />
            </div>
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
              <ArrowRightLeft size={18} className="text-slate-400" /> 
              <span>Всього маршрутів: <strong className="text-slate-900">{tariffs.length}</strong></span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Місто відправлення</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Місто призначення</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Тип / Розмір</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Базова ціна</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ціна за кг</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-sm text-slate-500 text-center">Завантаження тарифів...</td>
                  </tr>
                ) : displayedTariffs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-sm text-slate-500 text-center">Тарифів не знайдено.</td>
                  </tr>
                ) : displayedTariffs.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-6 font-semibold text-slate-900 text-sm">{t.from}</td>
                    <td className="px-6 py-6 font-semibold text-slate-900 text-sm">{t.to}</td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-800">{t.type}</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase mt-1">{t.size}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold text-slate-900 text-sm">
                        {t.basePrice}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-sm font-semibold text-slate-700">{t.perKg}</td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end">
                        <button className="p-2.5 text-slate-400 hover:text-pine hover:bg-pine/5 rounded-xl transition-all">
                          <Edit3 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ControlTariffsPage;