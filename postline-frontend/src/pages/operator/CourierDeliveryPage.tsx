/* AI STYLE AUDIT
- Прибрати або значно послабити `FloatingBackground`: еталон HomePage використовує легкий статичний декоративний шар, без нав'язливого руху.
- Привести контейнер до еталонної сітки (`max-w-7xl mx-auto px-6 md:px-10`), зараз `max-w-4xl` обмежує композицію.
- Уніфікувати статусні бейджі: `bg-blue-100` використовувати лише для семантики, а primary interactions лишити в `pine`.
- Карточки завдань мають відповідати еталону по тінях/бордерах (менше hover-ефектів, більше стабільного baseline стилю).
- Перевірити мобільне компонування правого action-блоку (border-top/left), щоб не ламався вертикальний ритм як у HomePage.
*/
import { Truck, MapPin, Phone, UserCheck } from 'lucide-react';
import FloatingBackground from '../../components/ui/FloatingBackground';

const CourierDeliveryPage = () => {
  const deliveries = [
    { id: 'PL-2024-00140', address: 'м. Львів, вул. Франка, 24, кв. 12', client: 'Оксана Петрівна', phone: '+380 97 111 22 33', status: 'Очікує кур\'єра' },
    { id: 'PL-2024-00145', address: 'м. Львів, пл. Ринок, 1 (Офіс 3)', client: 'ТОВ "Галичина"', phone: '+380 50 999 88 77', status: 'В дорозі до клієнта', courier: 'Степан К.' },
  ];

  return (
    <div className="relative min-h-screen bg-slate-100 flex flex-col">
      <FloatingBackground />

      <div className="relative z-10 px-4 md:px-8 pb-8 pt-4 animate-in fade-in duration-500 max-w-4xl mx-auto w-full flex-1">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Кур'єрська доставка
            </h1>
            <p className="text-slate-500 text-lg mt-3">
              Завдання на адресну доставку з вашого відділення
            </p>
          </div>
          <button className="px-8 py-3.5 bg-white/80 backdrop-blur border border-slate-200 text-slate-700 rounded-2xl text-base font-bold hover:bg-white hover:border-slate-300 active:scale-95 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap">
            <Truck size={18} /> Усі кур'єри
          </button>
        </div>

        <div className="space-y-5">
          {deliveries.map((item, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-bold text-slate-900 text-lg">{item.id}</span>
                  <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${item.courier ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-base text-slate-700 flex items-start gap-3 font-medium">
                    <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>{item.address}</span>
                  </p>
                  <p className="text-base text-slate-700 flex items-center gap-3 font-medium">
                    <Phone size={18} className="text-slate-400 shrink-0" />
                    {item.phone} <span className="text-slate-500 font-normal">({item.client})</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6">
                {item.courier ? (
                  <div className="text-sm">
                    <p className="text-xs text-slate-400 mb-2 font-bold uppercase">Призначений кур'єр:</p>
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck size={18} className="text-emerald-600" /> {item.courier}
                    </p>
                  </div>
                ) : (
                  <button className="w-full md:w-auto px-8 py-3 bg-pine text-white rounded-2xl text-base font-bold hover:bg-pine/90 active:scale-95 transition-all shadow-lg hover:shadow-xl">
                    Призначити кур'єра
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourierDeliveryPage;