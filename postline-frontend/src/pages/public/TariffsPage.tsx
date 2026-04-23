

import { Package, FileText, Truck, CheckCircle2, Calculator, MapPin, Scale } from 'lucide-react';

const TariffsPage = () => {
  const plans = [
    {
      title: 'Документи',
      icon: <FileText size={24} />,
      price: 'від 55 грн',
      description: 'Швидка доставка паперів та листів',
      features: ['Вага до 1 кг', 'Доставка 1-2 дні', "Кур'єрська доставка +35 грн", 'Фірмовий конверт'],
    },
    {
      title: 'Посилки',
      icon: <Package size={24} />,
      price: 'від 80 грн',
      description: 'Ідеальний вибір для покупок та подарунків',
      features: ['Вага до 30 кг', 'Доставка 1-3 дні', 'Пакування від 15 грн', 'Огляд перед отриманням'],
      popular: true,
    },
    {
      title: 'Вантажі',
      icon: <Truck size={24} />,
      price: 'від 250 грн',
      description: 'Для габаритних та комерційних відправлень',
      features: ['Вага від 30 до 1000 кг', 'Доставка 2-4 дні', 'Адресний забір', 'Паллетування'],
    }
  ];

  return (
    <main className="min-h-screen bg-slate-100 relative overflow-hidden flex flex-col">
      {/* Декоративний фон (уніфікований з іншими сторінками) */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-pine/5 via-transparent to-transparent pointer-events-none" />

      <section className="relative z-10 px-6 md:px-10 max-w-7xl mx-auto w-full py-12 md:py-16 space-y-10">

        {/* Хедер */}
        <div className="text-center max-w-3xl mx-auto border-b border-slate-200/0 pb-4">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Тарифи на доставку
          </h1>
          <p className="text-slate-500 text-lg">
            Прозорі ціни без прихованих платежів. Обирайте оптимальний тариф або скористайтеся калькулятором.
          </p>
        </div>

        {/* Компактний грід тарифів */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300 items-stretch">
          {plans.map((plan, index) => {
            const isPopular = plan.popular;
            
            return (
              <div 
                key={index} 
                className={`relative flex flex-col p-6 md:p-8 rounded-3xl border shadow-sm transition-all hover:-translate-y-1 ${
                  isPopular 
                    ? 'bg-pine text-white border-pine shadow-xl shadow-pine/20' 
                    : 'bg-white/80 backdrop-blur text-slate-900 border-slate-200 hover:shadow-lg hover:border-slate-300'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-8 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
                    Найпопулярніший
                  </div>
                )}

                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    isPopular ? 'bg-white/20 text-white' : 'bg-slate-50 text-pine border border-slate-100'
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                      {plan.title}
                    </h3>
                  </div>
                </div>

                <p className={`text-base mb-6 min-h-[48px] ${isPopular ? 'text-white/90' : 'text-slate-500'}`}>
                  {plan.description}
                </p>

                <div className={`mb-8 pb-8 border-b ${isPopular ? 'border-white/20' : 'border-slate-100'}`}>
                  <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                </div>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm font-semibold ${
                      isPopular ? 'text-white/95' : 'text-slate-700'
                    }`}>
                      <CheckCircle2 size={20} className={`shrink-0 mt-0.5 ${isPopular ? 'text-amber-400' : 'text-pine'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3.5 mt-auto rounded-2xl font-bold transition-all text-base active:scale-95 ${
                  isPopular 
                    ? 'bg-white text-pine hover:bg-slate-50 shadow-lg' 
                    : 'bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}>
                  Детальні умови
                </button>
              </div>
            );
          })}
        </div>

        {/* Нижній блок: Калькулятор на всю ширину */}
        <div className="w-full bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col pt-8">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
            <div className="p-3 bg-pine/10 text-pine rounded-xl"><Calculator size={22} /></div>
            <h3 className="text-xl font-bold text-slate-900">Швидкий розрахунок</h3>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin size={14}/> Звідки
              </label>
              <input type="text" placeholder="Місто відправлення" className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:border-pine focus:ring-2 focus:ring-pine/20 outline-none transition-all font-medium text-slate-800" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin size={14}/> Куди
              </label>
              <input type="text" placeholder="Місто отримання" className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:border-pine focus:ring-2 focus:ring-pine/20 outline-none transition-all font-medium text-slate-800" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Scale size={14}/> Вага (кг)
              </label>
              <input type="number" placeholder="0.0" className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:border-pine focus:ring-2 focus:ring-pine/20 outline-none transition-all font-medium text-slate-800" />
            </div>
            
            <div className="flex items-end h-full">
              <button type="button" className="w-full py-3 h-[46px] bg-pine text-white text-base font-bold rounded-2xl hover:bg-pine/90 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                Розрахувати
              </button>
            </div>
          </form>
        </div>

      </section>
    </main>
  );
};

export default TariffsPage;