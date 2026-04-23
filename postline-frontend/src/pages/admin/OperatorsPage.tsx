import { Edit3, Mail, MapPin, Search, ToggleLeft, UserPlus } from "lucide-react";

const OperatorsPage = () => {
  const isLoading = false;
  const operators = [
    { id: 1, name: "Іваненко Олег", email: "o.ivanenko@postline.ua", office: "№1, вул. Шевченка 15", status: "Активний", role: "Старший оператор" },
    { id: 2, name: "Максименко Тетяна", email: "t.maks@postline.ua", office: "№2, просп. Незалежності 34", status: "Активний", role: "Оператор" },
    { id: 3, name: "Ткаченко Роман", email: "r.tkach@postline.ua", office: "№3, вул. Франка 8", status: "Деактивований", role: "Оператор" },
  ];
  const displayedOperators = operators;

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-h-[104px]">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Управління операторами</h1>
            <p className="text-lg text-slate-500 mt-2">Керуйте доступами працівників та призначенням по відділеннях.</p>
          </div>

          <button className="flex items-center justify-center gap-2 px-7 py-3.5 bg-pine text-white rounded-2xl font-bold hover:bg-pine/90 transition-colors whitespace-nowrap">
            <UserPlus size={20} />
            <span>Новий оператор</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук за ім'ям, email або відділенням..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-pine outline-none text-sm transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-pine">
              <option>Всі відділення</option>
              <option>Відділення №1</option>
              <option>Відділення №2</option>
            </select>
            <select className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-pine">
              <option>Будь-який статус</option>
              <option>Активні</option>
              <option>Деактивовані</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Працівник</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Контакти / роль</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Локація</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Статус</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-sm text-slate-500 text-center">Завантаження операторів...</td>
                </tr>
              ) : displayedOperators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-sm text-slate-500 text-center">Операторів за заданими фільтрами не знайдено.</td>
                </tr>
              ) : displayedOperators.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-pine font-bold text-sm">
                        {op.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{op.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{op.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" /> {op.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={14} className="text-slate-400" /> {op.office}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      op.status === 'Активний'
                      ? 'bg-pine/10 text-pine'
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                      {op.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-pine transition-colors" title="Редагувати">
                        <Edit3 size={18} />
                      </button>
                      <button className="p-2.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-pine transition-colors" title="Змінити статус">
                        <ToggleLeft size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          <div className="p-5 border-t border-slate-100 bg-slate-50/60">
            <p className="text-sm text-slate-500 text-center">
              Лише адміністратор може створювати та деактивувати облікові записи операторів
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default OperatorsPage;