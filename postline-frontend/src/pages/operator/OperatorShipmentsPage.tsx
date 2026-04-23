
import { useState, useMemo } from 'react';
import { Search, Filter, Printer, MoreHorizontal, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

// Мокові дані (статуси приведено до єдиного формату)
const mockShipments = [
  { id: 'PL-2024-00128', date: '12.06.2024', sender: 'Боднар Н.', receiver: 'Коваль О.', type: 'Посилка', status: 'Готове до видачі' },
  { id: 'PL-2024-00129', date: '12.06.2024', sender: 'Іванов І.', receiver: 'Петренко В.', type: 'Документи', status: 'В дорозі' },
  { id: 'PL-2024-00130', date: '12.06.2024', sender: 'ТОВ "Альфа"', receiver: 'Сидоренко М.', type: 'Вантаж', status: 'Прийнято' },
  { id: 'PL-2024-00131', date: '11.06.2024', sender: 'Мельник С.', receiver: 'Боднар Н.', type: 'Посилка', status: 'Видано' },
  { id: 'PL-2024-00132', date: '10.06.2024', sender: 'Петренко В.', receiver: 'Іванов І.', type: 'Бандероль', status: 'Скасовано' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Видано': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'В дорозі': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Готове до видачі': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Скасовано': return 'bg-red-100 text-red-700 border-red-200';
    case 'Прийнято': default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

type SortConfig = {
  key: keyof typeof mockShipments[0] | null;
  direction: 'asc' | 'desc';
};

type SortIconProps = {
  columnKey: keyof typeof mockShipments[0];
  sortConfig: SortConfig;
};

// Компонент іконки для заголовків таблиці
const SortIcon = ({ columnKey, sortConfig }: SortIconProps) => {
  if (sortConfig.key !== columnKey) {
    return <ArrowUpDown size={14} className="text-slate-300 group-hover:text-pine transition-colors" />;
  }
  return sortConfig.direction === 'asc' 
    ? <ChevronUp size={16} className="text-pine" /> 
    : <ChevronDown size={16} className="text-pine" />;
};

const OperatorShipmentsPage = () => {
  // Стан для фільтрації та пошуку
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Всі статуси');
  
  // Стан для сортування
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  // Обробка кліку по заголовку
  const handleSort = (key: keyof typeof mockShipments[0]) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Фільтрація та сортування
  const filteredAndSortedShipments = useMemo(() => {
    let result = [...mockShipments];

    // Пошук
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(lowerSearch) ||
          s.sender.toLowerCase().includes(lowerSearch) ||
          s.receiver.toLowerCase().includes(lowerSearch) ||
          s.date.includes(searchTerm)
      );
    }

    // Фільтр за статусом
    if (statusFilter !== 'Всі статуси') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Сортування
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === 'date') {
          const dateA = a.date.split('.').reverse().join('-');
          const dateB = b.date.split('.').reverse().join('-');
          return sortConfig.direction === 'asc' 
            ? dateA.localeCompare(dateB) 
            : dateB.localeCompare(dateA);
        }

        const valA = a[sortConfig.key as keyof typeof a];
        const valB = b[sortConfig.key as keyof typeof b];
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, statusFilter, sortConfig]);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Відправлення відділення
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2">
          Керування посилками та контроль статусів Відділення №1.
        </p>
      </div>

      {/* Панель керування (Пошук і фільтри) */}
      <div className="bg-white/80 backdrop-blur p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between transition-all hover:border-slate-300">
        <div className="relative w-full md:flex-1 md:min-w-[300px]">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Пошук за ТТН, датою або ПІБ..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-56">
            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine focus:bg-white text-slate-600 font-medium cursor-pointer transition-all appearance-none text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Всі статуси</option>
              <option>Прийнято</option>
              <option>В дорозі</option>
              <option>Готове до видачі</option>
              <option>Видано</option>
              <option>Скасовано</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблиця */}
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:border-slate-300">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-black select-none">
                <th onClick={() => handleSort('id')} className="p-5 cursor-pointer hover:bg-slate-100/80 transition-colors group">
                  <div className="flex items-center gap-2">Трекінг-номер <SortIcon columnKey="id" sortConfig={sortConfig} /></div>
                </th>
                <th onClick={() => handleSort('date')} className="p-5 cursor-pointer hover:bg-slate-100/80 transition-colors group">
                  <div className="flex items-center gap-2">Дата <SortIcon columnKey="date" sortConfig={sortConfig} /></div>
                </th>
                <th onClick={() => handleSort('sender')} className="p-5 cursor-pointer hover:bg-slate-100/80 transition-colors group">
                  <div className="flex items-center gap-2">Відправник <SortIcon columnKey="sender" sortConfig={sortConfig} /></div>
                </th>
                <th onClick={() => handleSort('receiver')} className="p-5 cursor-pointer hover:bg-slate-100/80 transition-colors group">
                  <div className="flex items-center gap-2">Одержувач <SortIcon columnKey="receiver" sortConfig={sortConfig} /></div>
                </th>
                <th onClick={() => handleSort('type')} className="p-5 cursor-pointer hover:bg-slate-100/80 transition-colors group">
                  <div className="flex items-center gap-2">Тип <SortIcon columnKey="type" sortConfig={sortConfig} /></div>
                </th>
                <th onClick={() => handleSort('status')} className="p-5 cursor-pointer hover:bg-slate-100/80 transition-colors group">
                  <div className="flex items-center gap-2">Статус <SortIcon columnKey="status" sortConfig={sortConfig} /></div>
                </th>
                <th className="p-5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedShipments.length > 0 ? (
                filteredAndSortedShipments.map((shipment) => (
                  <tr 
                    key={shipment.id} 
                    className="border-b border-slate-100 last:border-0 hover:bg-pine/5 even:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-5 font-bold text-pine group-hover:text-emerald-700 transition-colors">{shipment.id}</td>
                    <td className="p-5 text-slate-600 font-medium text-sm">{shipment.date}</td>
                    <td className="p-5 text-slate-800 font-semibold text-sm">{shipment.sender}</td>
                    <td className="p-5 text-slate-800 font-semibold text-sm">{shipment.receiver}</td>
                    <td className="p-5 text-slate-600 text-sm">{shipment.type}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg border ${getStatusBadge(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-pine hover:bg-pine/10 rounded-xl transition-all">
                          <Printer size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-pine hover:bg-pine/10 rounded-xl transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-medium">
                    За вашим запитом нічого не знайдено. Спробуйте змінити параметри пошуку.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default OperatorShipmentsPage;