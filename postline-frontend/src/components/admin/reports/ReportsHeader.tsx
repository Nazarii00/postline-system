import { Download, RefreshCcw } from 'lucide-react';

type ReportsHeaderProps = {
  hasData: boolean;
  onResetFilters: () => void;
  onExportCsv: () => void;
};

export const ReportsHeader = ({ hasData, onResetFilters, onExportCsv }: ReportsHeaderProps) => (
  <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 min-h-[104px]">
    <div>
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
        Аналітика та звіти
      </h1>
      <p className="text-slate-500 text-lg mt-3">
        Фінанси, статуси, маршрути, відділення та кур'єрська ефективність.
      </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        type="button"
        onClick={onResetFilters}
        className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:border-slate-300 transition-colors"
      >
        <RefreshCcw size={18} />
        Скинути
      </button>
      <button
        type="button"
        onClick={onExportCsv}
        disabled={!hasData}
        className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-md whitespace-nowrap transition-colors ${
          hasData
            ? 'bg-pine text-white hover:bg-pine/90'
            : 'bg-pine/60 text-white cursor-not-allowed'
        }`}
      >
        <Download size={18} />
        Експорт CSV
      </button>
    </div>
  </div>
);
