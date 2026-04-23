import {
  Plus,
  Phone,
  Clock,
  Package,
  ChevronRight,
  Search,
  Activity
} from 'lucide-react';

const OfficesPage = () => {
  const isLoading = false;
  const offices = [
    { 
      id: 1, 
      number: "1", 
      city: "Київ", 
      address: "вул. Шевченка, 15", 
      phone: "+380 44 123 45 67", 
      workTime: "09:00 - 21:00",
      load: "High", 
      parcels: 142 
    },
    { 
      id: 2, 
      number: "2", 
      city: "Львів", 
      address: "просп. Свободи, 24", 
      phone: "+380 32 987 65 43", 
      workTime: "08:00 - 20:00",
      load: "Medium", 
      parcels: 64 
    },
    { 
      id: 3, 
      number: "3", 
      city: "Одеса", 
      address: "вул. Дерибасівська, 1", 
      phone: "+380 48 555 11 22", 
      workTime: "09:00 - 19:00",
      load: "Low", 
      parcels: 28 
    },
  ];
  const displayedOffices = offices;

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-h-[104px]">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Мережа відділень
            </h1>
            <p className="text-slate-500 text-lg mt-3">
              Керування фізичними точками прийому та видачі
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 px-7 py-3.5 bg-pine text-white rounded-2xl font-bold hover:bg-pine/90 transition-colors whitespace-nowrap">
            <Plus size={20} />
            <span>Додати відділення</span>
          </button>
        </div>

        <div className="relative">
          <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Пошук відділення за містом або адресою..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-pine outline-none shadow-sm transition-all text-sm"
          />
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-sm text-slate-500">Завантаження відділень...</div>
        ) : displayedOffices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-sm text-slate-500">Не знайдено відділень за вашим запитом.</div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedOffices.map((office) => (
            <article key={office.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[310px] flex flex-col">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pine/10 rounded-xl flex items-center justify-center text-pine font-black text-lg">
                    {office.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{office.city}</h3>
                    <p className="text-sm text-slate-500 mt-1">{office.address}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  office.load === 'High' ? 'bg-slate-200 text-slate-700' :
                  office.load === 'Medium' ? 'bg-pine/10 text-pine' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {office.load === 'High' ? 'Завантажено' : office.load === 'Medium' ? 'Норма' : 'Вільно'}
                </span>
              </div>

              <div className="space-y-3 mb-5 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <Clock size={16} className="text-pine" />
                  <span className="font-semibold">{office.workTime}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <Phone size={16} className="text-pine" />
                  <span className="font-semibold tracking-tight">{office.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 mb-2">Посилок сьогодні</span>
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-pine" />
                    <span className="text-xl font-black text-slate-900">{office.parcels}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-500 mb-2">Статус</span>
                  <div className="flex items-center gap-1.5 text-pine font-semibold text-sm">
                    <Activity size={16} className="text-pine" /> Online
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-pine hover:text-white transition-colors mt-auto">
                Детальна статистика <ChevronRight size={18} />
              </button>
            </article>
          ))}
        </div>
        )}
      </section>
    </main>
  );
};

export default OfficesPage;