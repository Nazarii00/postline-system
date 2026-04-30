import { Filter, Search } from 'lucide-react';
import { INPUT_LIMITS, sanitizePlainText } from '../../../utils/formUtils';

type ClientShipmentFiltersProps = {
  searchTerm: string;
  statusFilter: string;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
};

export const ClientShipmentFilters = ({
  searchTerm,
  statusFilter,
  onSearchTermChange,
  onStatusFilterChange,
}: ClientShipmentFiltersProps) => (
  <div className="bg-white/80 backdrop-blur p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
    <div className="relative w-full md:flex-1 md:min-w-[300px]">
      <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Пошук за номером або ПІБ..."
        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium"
        value={searchTerm}
        onChange={(event) =>
          onSearchTermChange(sanitizePlainText(event.target.value, INPUT_LIMITS.nameMax))
        }
        maxLength={INPUT_LIMITS.nameMax}
      />
    </div>

    <div className="relative w-full md:w-64">
      <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <select
        className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine focus:bg-white text-slate-600 font-medium cursor-pointer transition-all appearance-none text-sm"
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value)}
      >
        <option value="all">Всі статуси</option>
        <option value="accepted">Прийнято</option>
        <option value="sorting">На сортуванні</option>
        <option value="in_transit">В дорозі</option>
        <option value="arrived">У відділенні</option>
        <option value="ready_for_pickup">Готове до видачі</option>
        <option value="delivered">Доставлено</option>
        <option value="returned">Повернуто</option>
        <option value="cancelled">Скасовано</option>
      </select>
    </div>
  </div>
);
