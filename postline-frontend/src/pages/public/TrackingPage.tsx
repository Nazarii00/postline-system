import { useState } from 'react';
import { Package, MapPin, Calendar, Scale, Truck, CheckCircle2, CircleDashed, Search, User, CreditCard, Loader2, AlertCircle } from 'lucide-react';

const TrackingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Додані стани для роботи з API
  const [parcelData, setParcelData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setParcelData(null); // Очищаємо попередні результати

    try {
      // Звернення до твого реального API
      const response = await fetch(`http://localhost:3000/api/tracking/${searchQuery.trim()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Відправлення не знайдено');
      }

      const data = await response.json();
      setParcelData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 relative overflow-hidden flex flex-col">
      {/* Простий декоративний фон для підтримки консистентності з HomePage (без важких компонентів) */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-pine/5 via-transparent to-transparent pointer-events-none" />

      <section className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto w-full py-12 md:py-16 space-y-10">

        {/* Блок пошуку */}
        <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Відстеження відправлення
          </h1>
          <p className="text-slate-500 mb-10 max-w-2xl mx-auto text-lg">
            Введіть номер накладної, щоб перевірити статус доставки та історію переміщень вашої посилки.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Наприклад: PL-2024-00128"
                className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine focus:ring-2 focus:ring-pine/20 transition-all text-lg font-medium text-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !searchQuery.trim()}
              className="px-10 py-4 bg-pine text-white font-bold rounded-2xl hover:bg-pine/90 active:scale-95 transition-all shadow-lg hover:shadow-xl text-lg whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              Відстежити
            </button>
          </form>
        </div>

        {/* Відображення помилки (зберігає стилістику) */}
        {error && hasSearched && (
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur p-6 rounded-3xl border border-red-200 text-red-600 shadow-sm flex items-center justify-center gap-3 animate-in fade-in">
            <AlertCircle size={24} />
            <p className="font-bold text-lg">{error}</p>
          </div>
        )}

        {/* Результати (рендериться тільки якщо є дані) */}
        {hasSearched && parcelData && !isLoading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Хедер статусу */}
            <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Номер накладної</p>
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                  {parcelData.trackingNumber}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-slate-500 mt-4 text-sm font-semibold">
                  <span className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400"/> {parcelData.registrationDate}</span>
                  <span className="flex items-center gap-1.5"><Package size={16} className="text-slate-400"/> {parcelData.type}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400"/> {parcelData.route}</span>
                </div>
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-2xl font-bold border border-emerald-200 flex items-center gap-3 text-base whitespace-nowrap">
                <Truck size={22} className="text-emerald-600" /> {parcelData.status}
              </div>
            </div>

            {/* Грід з деталями (4 колонки) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-pine/10 rounded-lg">
                    <User size={18} className="text-pine" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Відправник</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex flex-col"><span className="text-slate-400 text-xs mb-1 font-semibold uppercase">ПІБ</span> <span className="font-semibold text-slate-900">{parcelData.sender.name}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs mb-1 font-semibold uppercase">Місто</span> <span className="font-semibold text-slate-900">{parcelData.sender.city}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs mb-1 font-semibold uppercase">Відділення</span> <span className="text-slate-700 font-medium leading-snug">{parcelData.sender.branch}</span></div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-pine/10 rounded-lg">
                    <MapPin size={18} className="text-pine" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Одержувач</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex flex-col"><span className="text-slate-400 text-xs mb-1 font-semibold uppercase">ПІБ</span> <span className="font-semibold text-slate-900">{parcelData.receiver.name}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs mb-1 font-semibold uppercase">Місто</span> <span className="font-semibold text-slate-900">{parcelData.receiver.city}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs mb-1 font-semibold uppercase">Відділення / Адреса</span> <span className="text-slate-700 font-medium leading-snug">{parcelData.receiver.branch}</span></div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-pine/10 rounded-lg">
                    <Scale size={18} className="text-pine" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Параметри</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2.5"><span className="text-slate-600 font-medium">Тип</span> <span className="font-semibold text-slate-900">{parcelData.type}</span></div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2.5"><span className="text-slate-600 font-medium">Вага</span> <span className="font-semibold text-slate-900">{parcelData.details.weight}</span></div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2.5"><span className="text-slate-600 font-medium">Габарити</span> <span className="font-semibold text-slate-900">{parcelData.details.dimensions}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">Оголош. вартість</span> <span className="font-semibold text-slate-900">{parcelData.details.declaredValue}</span></div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-pine/10 rounded-lg">
                    <CreditCard size={18} className="text-pine" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Фінанси</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2.5"><span className="text-slate-600 font-medium">До сплати</span> <span className="font-black text-pine text-lg">{parcelData.financials.cost}</span></div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2.5"><span className="text-slate-600 font-medium">Платник</span> <span className="font-semibold text-slate-900">Одержувач</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">Тип доставки</span> <span className="font-semibold text-slate-900">{parcelData.financials.deliveryType}</span></div>
                </div>
              </div>

            </div>

            {/* Таймлайн (Реалізовано через space-y замість фіксованих марджинів) */}
            <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <h3 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-5">
                Історія переміщень
              </h3>

              <div className="flex flex-col ml-2 space-y-6">
                {parcelData.history.map((item: any, index: number) => {
                  const isLast = index === parcelData.history.length - 1;
                  return (
                    <div key={index} className="flex gap-5 group relative">
                      
                      {/* Лінія, що з'єднує етапи */}
                      {!isLast && (
                        <div className={`absolute top-10 bottom-[-24px] left-[19px] w-[2px] rounded-full ${
                          item.isCompleted ? 'bg-pine/30' : 'bg-slate-100'
                        }`}></div>
                      )}

                      <div className="flex flex-col items-center shrink-0 z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          item.isAlert 
                            ? 'bg-red-100 text-red-500 border-2 border-red-200' 
                            : item.isCompleted
                              ? 'bg-pine text-white shadow-sm'
                              : 'bg-slate-50 text-slate-300 border-2 border-slate-200'
                        }`}>
                          {item.isAlert ? <AlertCircle size={20} /> : (item.isCompleted ? <CheckCircle2 size={20} /> : <CircleDashed size={20} />)}
                        </div>
                      </div>

                      <div className="pt-2 pb-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h4 className={`text-base font-bold ${
                            item.isAlert ? 'text-red-600' : (item.isCompleted ? 'text-slate-900' : 'text-slate-400')
                          }`}>
                            {item.status}
                          </h4>
                          {item.date && (
                            <span className="text-sm font-semibold text-slate-400">{item.date}</span>
                          )}
                        </div>
                        <p className={`text-sm mt-2 font-medium ${item.isAlert ? 'text-red-500' : (item.isCompleted ? 'text-slate-600' : 'text-slate-400')}`}>
                          {item.location}
                        </p>
                        {item.actor && (
                          <p className="text-xs text-slate-400 mt-2.5 font-semibold">
                            {item.actor}
                          </p>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Показувати кнопку "Скасувати відправлення" лише коли статус 'accepted' */}
              {parcelData.rawStatus === 'accepted' && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button className="text-slate-500 hover:text-red-600 font-bold transition-all text-sm px-4 py-2.5 hover:bg-red-50 rounded-lg -ml-4">
                    Скасувати відправлення
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </section>
    </main>
  );
};

export default TrackingPage;