import {
  BarChart3,
  Wallet,
  Download,
  Calendar,
  Package,
  FileText,
  Filter
} from 'lucide-react';

const ReportsPage = () => {
  const isLoading = false;
  const reports = [
    { name: "Звіт по доходам", date: "Березень 2026", size: "2.4 MB", type: "PDF" },
    { name: "Ефективність відділень", date: "Березень 2026", size: "1.1 MB", type: "XLSX" },
    { name: "Аналітика затримок", date: "Лютий 2026", size: "850 KB", type: "PDF" },
  ];
  const displayedReports = reports;

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-h-[104px]">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Аналітика та звіти
            </h1>
            <p className="text-slate-500 text-lg mt-3">
              Фінансові показники та ефективність логістики
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              <Calendar size={18} />
              <span>Останні 30 днів</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3.5 bg-pine text-white rounded-2xl text-sm font-bold hover:bg-pine/90 transition-colors shadow-md whitespace-nowrap">
              <Download size={18} />
              <span>Експорт</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[160px] flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-pine/10 text-pine flex items-center justify-center mb-4">
                <Wallet size={24} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">428,500 ₴</p>
            <p className="text-sm font-semibold text-slate-600 mt-2 mt-auto">Загальний виторг</p>
          </article>

          <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[160px] flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-pine/10 text-pine flex items-center justify-center mb-4">
                <Package size={24} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">8,240</p>
            <p className="text-sm font-semibold text-slate-600 mt-2 mt-auto">Відправлень за період</p>
          </article>

          <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[160px] flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-pine/10 text-pine flex items-center justify-center mb-4">
                <BarChart3 size={24} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">52.00 ₴</p>
            <p className="text-sm font-semibold text-slate-600 mt-2 mt-auto">Середній чек</p>
          </article>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[360px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-900 text-lg">Динаміка прибутку</h3>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-pine"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              </div>
            </div>
            <div className="flex-1 border-b border-l border-slate-100 relative flex items-end justify-between px-4 pb-2">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div key={i} style={{height: `${h}%`}} className="w-8 bg-slate-200 rounded-t-lg hover:bg-pine/70 transition-colors" />
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((d) => (
                <span key={d} className="text-xs font-semibold text-slate-500">{d}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Готові звіти</h3>
              <Filter size={18} className="text-slate-400" />
            </div>
            {isLoading ? (
              <div className="p-6 text-sm text-slate-500">Завантаження звітів...</div>
            ) : displayedReports.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">Немає готових звітів за обраний період.</div>
            ) : (
            <div className="divide-y divide-slate-100">
              {displayedReports.map((report, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50/70 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-pine">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{report.name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-xs font-bold text-pine hover:bg-pine/10 px-4 py-2 rounded-xl transition-colors border border-transparent">
                    <Download size={16} /> {report.type}
                  </button>
                </div>
              ))}
            </div>
            )}
            <div className="p-6 border-t border-slate-100">
              <button className="w-full py-3 border border-slate-200 rounded-2xl text-slate-600 text-sm font-bold hover:border-pine hover:text-pine transition-colors">
                + Згенерувати кастомний звіт
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ReportsPage;