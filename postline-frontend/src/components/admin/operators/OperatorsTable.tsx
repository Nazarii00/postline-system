import { useState, useMemo } from "react";
import { Edit3, Mail, MapPin, Search, ToggleLeft } from "lucide-react";
import { Pagination } from "../../ui/Pagination";
import { usePagination } from "../../../hooks/usePagination";
import type { Operator, Department } from "../../../types/operators";
import { INPUT_LIMITS, sanitizePlainText } from "../../../utils/formUtils";

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
  const [statusFilter, setStatusFilter] = useState('active');

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

  const {
    activePage,
    endIndex,
    pageNumbers,
    paginatedItems: displayedOperators,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  } = usePagination(filteredOperators, 10);

  // Скидання сторінки при зміні фільтрів
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(sanitizePlainText(e.target.value, INPUT_LIMITS.nameMax));
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
            maxLength={INPUT_LIMITS.nameMax}
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

        {totalItems > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <Pagination
              activePage={activePage}
              endIndex={endIndex}
              itemLabel="працівників"
              onPageChange={setCurrentPage}
              pageNumbers={pageNumbers}
              startIndex={startIndex}
              totalItems={totalItems}
              totalPages={totalPages}
            />
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
