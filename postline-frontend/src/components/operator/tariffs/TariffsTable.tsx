import { useState } from "react";
import { Edit3, Search, ArrowRightLeft, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { type Tariff } from "../../../types/tariffs";

interface TariffsTableProps {
  tariffs: Tariff[];
  isLoading: boolean;
  onEdit: (tariff: Tariff) => void;
  onDelete: (tariff: Tariff) => void;
}

const TariffsTable = ({ tariffs, isLoading, onEdit, onDelete }: TariffsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const safeTariffs = Array.isArray(tariffs) ? tariffs : [];
  const filteredTariffs = safeTariffs.filter((t) =>
    t.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTariffs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedTariffs = filteredTariffs.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Скидаємо на першу сторінку при пошуку
  };

  // Логіка для генерації масиву сторінок (з крапками, якщо їх багато)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md min-w-[280px]">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input 
            placeholder="Фільтр за містом..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-pine focus:bg-white transition-all" 
          />
        </div>
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <ArrowRightLeft size={18} className="text-slate-400" /> 
          <span>Знайдено маршрутів: <strong className="text-slate-900">{filteredTariffs.length}</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Маршрут</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Тип / Розмір</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Базова ціна</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ціна за кг</th>
              <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-sm text-slate-500 text-center">Завантаження...</td>
              </tr>
            ) : displayedTariffs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-sm text-slate-500 text-center">Тарифів не знайдено.</td>
              </tr>
            ) : displayedTariffs.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/70 transition-colors group">
                <td className="px-6 py-6 font-semibold text-slate-900 text-sm">
                  {t.from} <ArrowRightLeft size={14} className="inline text-slate-400 mx-1" /> {t.to}
                </td>
                <td className="px-6 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-800">{t.type}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase mt-1">{t.size}</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold text-slate-900 text-sm">{t.basePrice} ₴</span>
                </td>
                <td className="px-6 py-6 text-sm font-semibold text-slate-700">{t.perKg} ₴</td>
                <td className="px-6 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(t)} className="p-2.5 text-slate-400 hover:text-pine hover:bg-pine/5 rounded-xl transition-all">
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => onDelete(t)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагінація з номерами сторінок */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Попередня</span>
          </button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..."}
                className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors
                  ${page === "..." 
                    ? "text-slate-400 cursor-default" 
                    : page === currentPage 
                      ? "bg-pine text-white" 
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-white rounded-lg transition-colors"
          >
            <span className="hidden sm:inline">Наступна</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TariffsTable;