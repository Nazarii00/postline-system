
import { useState } from 'react';
import { Search, MapPin, Clock, Phone, Navigation } from 'lucide-react';

const mockBranches = [
  { id: 1, number: '№1', type: 'Вантажне', address: 'вул. Шевченка, 15', city: 'Львів', schedule: 'Пн-Пт: 08:00-20:00, Сб-Нд: 09:00-18:00', phone: '0 800 123 451', maxWeight: 'До 1000 кг', openNow: true },
  { id: 2, number: '№2', type: 'Поштове', address: 'просп. Свободи, 45', city: 'Львів', schedule: 'Пн-Пт: 08:00-21:00, Сб-Нд: 09:00-19:00', phone: '0 800 123 452', maxWeight: 'До 30 кг', openNow: true },
  { id: 3, number: '№3', type: 'Поштове', address: 'вул. Стрийська, 108', city: 'Львів', schedule: 'Пн-Пт: 09:00-20:00, Сб: 10:00-18:00, Нд: вихідний', phone: '0 800 123 453', maxWeight: 'До 30 кг', openNow: false },
  { id: 4, number: '№4', type: 'Міні-відділення', address: 'вул. Городоцька, 220', city: 'Львів', schedule: 'Пн-Нд: 09:00-21:00', phone: '0 800 123 454', maxWeight: 'До 10 кг', openNow: true },
];

const BranchesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredBranches = mockBranches.filter(b => 
    b.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100 relative overflow-hidden flex flex-col">
      {/* Декоративний фон */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-pine/5 via-transparent to-transparent pointer-events-none" />

      {/* Головний контейнер - ТЕПЕР НА ВСЮ ШИРИНУ */}
      <section className="relative z-10 w-full px-4 md:px-8 py-8 md:py-12 flex flex-col flex-1 min-h-[800px] h-[calc(100vh-120px)] space-y-8">

        {/* Уніфікований Хедер */}
        <div className="text-center w-full mx-auto pb-2 shrink-0">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Карта відділень
          </h1>
          <p className="text-slate-500 text-lg">
            Знайдіть найближче місце для відправки або отримання.
          </p>
        </div>

        {/* Робоча зона: Сайдбар + Карта */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 h-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">

          {/* Ліва колонка: Сайдбар */}
          <div className="w-full lg:w-[420px] shrink-0 flex flex-col bg-white/80 backdrop-blur rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all overflow-hidden">

            {/* Пошук у сайдбарі */}
            <div className="p-6 border-b border-slate-100 bg-white/50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Введіть місто, вулицю або номер..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine focus:ring-2 focus:ring-pine/20 transition-all text-base font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Скрол-список */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
              {filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => (
                  <div key={branch.id} className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-pine hover:shadow-lg hover:bg-slate-50/50 cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-pine transition-colors">
                          Відділення {branch.number}
                        </h3>
                        <p className="text-sm font-semibold text-slate-500 mt-1">{branch.type}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                          {branch.maxWeight}
                        </span>
                        {branch.openNow ? (
                           <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Відчинено
                           </span>
                        ) : (
                           <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-lg">
                             <div className="w-2 h-2 rounded-full bg-red-500"></div> Зачинено
                           </span>
                        )}
                      </div>
                    </div>

                    <p className="text-base text-slate-800 font-semibold mb-4">{branch.city}, {branch.address}</p>

                    <div className="space-y-2 bg-slate-50 p-3 rounded-2xl">
                      <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                        <Clock size={16} className="shrink-0 mt-0.5 text-pine" />
                        <span className="leading-tight">{branch.schedule}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <Phone size={16} className="shrink-0 text-pine" />
                        <span>{branch.phone}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <MapPin size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-500 font-semibold">За вашим запитом відділень не знайдено.</p>
                  <p className="text-sm text-slate-400 mt-1">Спробуйте змінити умови пошуку.</p>
                </div>
              )}
            </div>
          </div>

          {/* Права колонка: Гігантська Карта (Тепер займає всю ширину до правого краю) */}
          <div className="flex-1 bg-slate-200 rounded-3xl border border-slate-200 shadow-inner relative overflow-hidden flex items-center justify-center min-h-[400px] hover:border-slate-300 transition-all">
            {/* Стилізована заглушка карти */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)', backgroundSize: '32px 32px' }}>
            </div>

            {/* Макет інтерфейсу карти */}
            <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-20">
              <button className="w-12 h-12 bg-white/80 backdrop-blur rounded-2xl shadow-md flex items-center justify-center text-slate-700 hover:text-pine hover:bg-white transition-all font-bold text-xl">+</button>
              <button className="w-12 h-12 bg-white/80 backdrop-blur rounded-2xl shadow-md flex items-center justify-center text-slate-700 hover:text-pine hover:bg-white transition-all font-bold text-xl">−</button>
              <button className="w-12 h-12 bg-white/80 backdrop-blur rounded-2xl shadow-md flex items-center justify-center text-slate-700 hover:text-pine hover:bg-white transition-all mt-2">
                <Navigation size={20} />
              </button>
            </div>

            <div className="text-center z-10 p-10 max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
              <div className="w-24 h-24 bg-pine/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={48} className="text-pine" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Інтерактивна карта простору</h3>
              <p className="text-slate-500 text-base mb-8 leading-relaxed">
                Тут буде підключено Google Maps або Mapbox API. Маркери автоматично фільтруватимуться відповідно до списку зліва.
              </p>
              <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-pine text-white font-bold rounded-2xl hover:bg-pine/90 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                Завантажити карту
              </button>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default BranchesPage;