/* AI STYLE AUDIT
- Градієнт банера (`from-pine/90 to-pine`) має бути більш стриманим: еталон переважно використовує чисті площини без різких переходів.
- Вирівняти секційну структуру до HomePage: чіткі блоки з однаковими зовнішніми відступами між картками.
- Вторинну кнопку `Змінити пароль` зробити ближчою до еталонного secondary pattern (менше контрасту, стабільний border/text tone).
- Уніфікувати форми за ритмом label/input: частина полів має занадто дрібний uppercase, що ускладнює читання на мобільному.
- Перевірити, щоб усі CTA (`Зберегти зміни`) мали однаковий стиль із еталонним `bg-pine text-white hover:bg-pine/90`.
*/
import { Phone, Mail, MapPin, Shield } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Мій профіль
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2">
          Персональні дані та налаштування доставки.
        </p>
      </div>

      {/* Головна картка профілю */}
      <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Банер */}
        <div className="h-32 bg-gradient-to-r from-pine/90 to-pine w-full"></div>
        
        <div className="px-6 md:px-10 pb-10 relative">
          {/* Аватар та інфо */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-8">
            <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-sm shrink-0 -mt-12 relative z-10">
              <div className="w-full h-full bg-pine/10 rounded-full flex items-center justify-center border border-pine/20">
                <span className="text-2xl font-black text-pine">БН</span>
              </div>
            </div>
            <div className="pt-2 sm:pt-0 sm:pb-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Боднар Назарій</h2>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                ID: PL-8472910
              </p>
            </div>
          </div>

          {/* Форма особистих даних */}
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                  Прізвище та Ім'я
                </label>
                <input 
                  type="text" 
                  defaultValue="Боднар Назарій" 
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium text-slate-900"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                  Телефон
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="tel" 
                    defaultValue="+380 97 123 45 67" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                  Електронна пошта
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email" 
                    defaultValue="n.bodnar@example.com" 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="button" className="px-8 py-3.5 bg-pine text-white text-sm font-bold rounded-2xl hover:bg-pine/90 active:scale-95 transition-all shadow-lg shadow-pine/20 hover:shadow-xl">
                Зберегти зміни
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Налаштування доставки */}
      <div className="bg-white/90 backdrop-blur p-6 md:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 md:gap-12 items-start">
        <div className="w-full md:w-1/3">
          <div className="w-12 h-12 bg-pine/10 text-pine rounded-2xl flex items-center justify-center mb-4">
            <MapPin size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Адреса за замовчуванням</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Ці дані будуть підставлятися автоматично при оформленні нових відправлень.
          </p>
        </div>
        
        <div className="w-full md:w-2/3 space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Місто
            </label>
            <input 
              type="text" 
              defaultValue="Київ" 
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium text-slate-900"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Улюблене відділення
            </label>
            <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium text-slate-900 appearance-none cursor-pointer">
              <option>Відділення №3 (вул. Хрещатик, 22)</option>
              <option>Відділення №1 (вул. Велика Васильківська, 100)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Безпека */}
      <div className="bg-white/90 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Безпека акаунту</h3>
            <p className="text-sm text-slate-500 mt-1">Останній вхід: сьогодні о 14:23</p>
          </div>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-colors active:scale-95 shadow-sm">
          Змінити пароль
        </button>
      </div>

    </div>
  );
};

export default ProfilePage;