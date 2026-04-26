import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ArrowUpDown, Filter } from 'lucide-react';
import { api } from '../../services/api';
import type { Shipment } from '../../types/shipment';

const STATUS_LABELS: Record<string, string> = {
  accepted: 'Прийнято',
  sorting: 'На сортуванні',
  in_transit: 'В дорозі',
  arrived: 'У відділенні',
  ready_for_pickup: 'Готове до видачі',
  delivered: 'Доставлено',
  returned: 'Повернуто',
  cancelled: 'Скасовано',
};

const TYPE_LABELS: Record<string, string> = {
  letter: 'Лист',
  parcel: 'Посилка',
  package: 'Бандероль',
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'in_transit':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'ready_for_pickup':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'returned':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

type SortConfig = {
  key: keyof Shipment | null;
  direction: 'asc' | 'desc';
};

type SortIconProps = {
  columnKey: keyof Shipment;
  sortConfig: SortConfig;
};

const SortIcon = ({ columnKey, sortConfig }: SortIconProps) => {
  if (sortConfig.key !== columnKey) {
    return <ArrowUpDown size={14} className="text-slate-300 group-hover:text-pine transition-colors" />;
  }
  return sortConfig.direction === 'asc'
    ? <ChevronUp size={16} className="text-pine" />
    : <ChevronDown size={16} className="text-pine" />;
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  useEffect(() => {
    api.get<{ data: Shipment[] }>('/shipments')
      .then((res) => setShipments(res.data))
      .catch(() => setError('Не вдалося завантажити відправлення'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSort = (key: keyof Shipment) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...shipments];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((shipment) =>
        shipment.tracking_number.toLowerCase().includes(lower) ||
        shipment.sender_name?.toLowerCase().includes(lower) ||
        shipment.receiver_name?.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((shipment) => shipment.status === statusFilter);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [shipments, searchTerm, statusFilter, sortConfig]);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Мої відправлення
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2">
          Керуйте своїми посилками та відстежуйте їх поточний статус.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:flex-1 md:min-w-[300px]">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Пошук за номером або ПІБ..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-64">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine focus:bg-white text-slate-600 font-medium cursor-pointer transition-all appearance-none text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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

      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Завантаження...</div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 font-medium">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-black select-none">
                  {[
                    { key: 'tracking_number', label: 'Трекінг-номер' },
                    { key: 'created_at', label: 'Дата реєстрації' },
                    { key: 'sender_name', label: 'Відправник' },
                    { key: 'receiver_name', label: 'Одержувач' },
                    { key: 'shipment_type', label: 'Тип' },
                    { key: 'status', label: 'Статус' },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key as keyof Shipment)}
                      className="p-5 cursor-pointer hover:bg-slate-100/80 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        {label}
                        <SortIcon columnKey={key as keyof Shipment} sortConfig={sortConfig} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map((shipment) => (
                    <tr
                      key={shipment.id}
                      onClick={() => navigate(`/client/shipment/${shipment.id}`)}
                      className="border-b border-slate-100 last:border-0 hover:bg-pine/5 even:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="p-5 font-bold text-pine group-hover:text-emerald-700 transition-colors">
                        {shipment.tracking_number}
                      </td>
                      <td className="p-5 text-slate-600 font-medium text-sm">
                        {new Date(shipment.created_at).toLocaleDateString('uk-UA')}
                      </td>
                      <td className="p-5 text-slate-800 font-semibold text-sm">{shipment.sender_name}</td>
                      <td className="p-5 text-slate-800 font-semibold text-sm">{shipment.receiver_name}</td>
                      <td className="p-5 text-slate-600 text-sm">{TYPE_LABELS[shipment.shipment_type] ?? shipment.shipment_type}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg border ${getStatusBadge(shipment.status)}`}>
                          {STATUS_LABELS[shipment.status] ?? shipment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                      За вашим запитом нічого не знайдено.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
