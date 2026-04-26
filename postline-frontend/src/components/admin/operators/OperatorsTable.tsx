import { useState, useMemo } from "react";
import { Edit3, Mail, MapPin, Search, ToggleLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Operator, Department } from "../../../types/operators";

interface OperatorsTableProps {
  operators: Operator[];
  departments: Department[];
  isLoading: boolean;
  onToggleStatus: (op: Operator) => void;
  onEdit: (op: Operator) => void;
}

const OperatorsTable = ({ operators, departments, isLoading, onToggleStatus, onEdit }: OperatorsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Форматування ролі та ініціалів
  const formatRole = (role: string) => {
    switch (role) {
      case 'operator': return 'Оператор';
      case 'courier': return "Кур'єр";
      case 'admin': return 'Адміністратор';
      default: return role;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Фільтрація
  const filteredOperators = useMemo(() => {
    let result = [...(Array.isArray(operators) ? operators : [])];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((op) =>
        op.full_name?.toLowerCase().includes(lower) ||
        op.email?.toLowerCase().includes(lower)
      );
    }

    if (departmentFilter !== 'all') {
      result = result.filter((op) => op.department_id === Number(departmentFilter));
    }

    if (statusFilter === 'active') {
      result = result.filter((op) => op.deleted_at === null);
    } else if (statusFilter === 'inactive') {
      result = result.filter((op) => op.deleted_at !== null);
    }

    return result;
  }, [operators, searchTerm, departmentFilter, statusFilter]);

  // Пагінація
  const totalPages = Math.ceil(filteredOperators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedOperators = filteredOperators.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
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

  // Скидання сторінки при зміні фільтрів
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Фільтри */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Пошук за ім'ям або email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-pine outline-none text-sm transition-all font-medium"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <select
            className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-pine cursor-pointer"
            value={departmentFilter}
            onChange={handleDeptChange}
          >
            <option value="all">Всі відділення</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.city} — {d.address}</option>
            ))}
          </select>
          <select
            className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-pine cursor-pointer"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">Будь-який статус</option>
            <option value="active">Активні</option>
            <option value="inactive">Деактивовані</option>
          </select>
        </div>
      </div>

      {/* Таблиця */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Працівник', 'Контакти / Роль', 'Локація', 'Статус', 'Дії'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Завантаження...
                  </td>
                </tr>
              ) : displayedOperators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Операторів не знайдено.
                  </td>
                </tr>
              ) : displayedOperators.map((op) => {
                const isActive = op.deleted_at === null;
                const dept = departments.find((d) => d.id === op.department_id);

                return (
                  <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-pine font-bold text-sm shrink-0">
                          {getInitials(op.full_name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{op.full_name}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">{formatRole(op.role)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <Mail size={14} className="text-slate-400" /> {op.email}
                        </div>
                        {op.phone && (
                          <p className="text-xs text-slate-500">{op.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <MapPin size={14} className="text-slate-400" />
                        {dept ? `${dept.city} — ${dept.address}` : 'Не призначено'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-widest font-bold border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {isActive ? 'Активний' : 'Деактивований'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onEdit(op)}
                          className="p-2 text-slate-400 hover:text-pine hover:bg-pine/5 rounded-xl transition-all"
                          title="Редагувати"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => onToggleStatus(op)}
                          className={`p-2 hover:bg-pine/5 rounded-xl transition-all ${
                            isActive ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-emerald-500'
                          }`}
                          title={isActive ? 'Деактивувати' : 'Активувати'}
                        >
                          <ToggleLeft size={18} className={isActive ? '' : 'rotate-180'} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                        ? "bg-pine text-white shadow-sm" 
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

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs font-medium text-slate-400 text-center uppercase tracking-wider">
            Лише адміністратор може створювати та деактивувати облікові записи
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperatorsTable;