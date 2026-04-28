import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { api } from '../../services/api';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import type { Shipment } from '../../types/shipment';
import { INPUT_LIMITS, sanitizePlainText } from '../../utils/formUtils';

const SHIPMENTS_PER_PAGE = 10;

const TYPE_LABELS: Record<string, string> = {
  letter: 'Лист',
  parcel: 'Посилка',
  package: 'Бандероль',
};

const STATUS_LABELS: Record<string, string> = {
  accepted: 'Прийнято',
  sorting: 'На сортуванні',
  in_transit: 'В дорозі',
  arrived: 'У відділенні',
  ready_for_pickup: 'Готове до видачі',
  delivered: 'Видано',
  returned: 'Повернуто',
  cancelled: 'Скасовано',
};

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'in_transit':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ready_for_pickup':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'returned':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

type SortConfig = { key: keyof Shipment | null; direction: 'asc' | 'desc' };
type SortIconProps = { columnKey: keyof Shipment; sortConfig: SortConfig };

const SortIcon = ({ columnKey, sortConfig }: SortIconProps) => {
  if (sortConfig.key !== columnKey) {
    return <ArrowUpDown size={14} className="text-slate-300 group-hover:text-pine transition-colors" />;
  }
  return sortConfig.direction === 'asc'
    ? <ChevronUp size={16} className="text-pine" />
    : <ChevronDown size={16} className="text-pine" />;
};

const OperatorShipmentsPage = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (sortConfig.key) {
      params.set('sortBy', sortConfig.key);
      params.set('sortOrder', sortConfig.direction);
    }

    const query = params.toString();
    api.get<{ data: Shipment[] }>(`/shipments${query ? `?${query}` : ''}`)
      .then((res) => {
        setShipments(res.data);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Помилка підключення до сервера'))
      .finally(() => setIsLoading(false));
  }, [searchTerm, statusFilter, sortConfig]);

  const handleSort = (key: keyof Shipment) => {
    setCurrentPage(1);
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
        shipment.tracking_number?.toLowerCase().includes(lower) ||
        shipment.sender_name?.toLowerCase().includes(lower) ||
        shipment.receiver_name?.toLowerCase().includes(lower) ||
        formatDate(shipment.created_at).includes(lower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((shipment) => shipment.status === statusFilter);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === 'created_at') {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        const valA = a[sortConfig.key!] || '';
        const valB = b[sortConfig.key!] || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [shipments, searchTerm, statusFilter, sortConfig]);
  const {
    activePage,
    endIndex,
    pageNumbers,
    paginatedItems: paginatedShipments,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  } = usePagination(filteredAndSorted, SHIPMENTS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Відправлення відділення
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2">
          Керування посилками та контроль статусів.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:flex-1 md:min-w-[300px]">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Пошук за ТТН, датою або ПІБ..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pine/20 focus:border-pine focus:bg-white transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(sanitizePlainText(e.target.value, INPUT_LIMITS.nameMax));
              setCurrentPage(1);
            }}
            maxLength={INPUT_LIMITS.nameMax}
          />
        </div>

        <div className="relative w-full md:w-56">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine focus:bg-white text-slate-600 font-medium cursor-pointer transition-all appearance-none text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Всі статуси</option>
            <option value="accepted">Прийнято</option>
            <option value="sorting">На сортуванні</option>
            <option value="in_transit">В дорозі</option>
            <option value="arrived">У відділенні</option>
            <option value="ready_for_pickup">Готове до видачі</option>
            <option value="delivered">Видано</option>
            <option value="returned">Повернуто</option>
            <option value="cancelled">Скасовано</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-black select-none">
                {[
                  { key: 'tracking_number', label: 'Трекінг-номер' },
                  { key: 'created_at', label: 'Дата' },
                  { key: 'sender_name', label: 'Відправник' },
                  { key: 'receiver_name', label: 'Одержувач' },
                  { key: 'shipment_type', label: 'Тип' },
                  { key: 'status', label: 'Статус' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key as keyof Shipment)}
                    className="px-6 py-5 cursor-pointer hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      {label}
                      <SortIcon columnKey={key as keyof Shipment} sortConfig={sortConfig} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                    Завантаження даних...
                  </td>
                </tr>
              ) : filteredAndSorted.length > 0 ? (
                paginatedShipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    onClick={() => navigate(`/operator/shipment/${shipment.id}`)}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-pine">{shipment.tracking_number}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium text-sm">{formatDate(shipment.created_at)}</td>
                    <td className="px-6 py-4 text-slate-800 font-semibold text-sm max-w-[150px] truncate">{shipment.sender_name}</td>
                    <td className="px-6 py-4 text-slate-800 font-semibold text-sm max-w-[150px] truncate">{shipment.receiver_name}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{TYPE_LABELS[shipment.shipment_type] ?? shipment.shipment_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg border ${getStatusBadge(shipment.status)}`}>
                        {STATUS_LABELS[shipment.status] ?? shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button
                          className="p-2 text-slate-400 hover:text-pine hover:bg-pine/5 rounded-xl transition-all"
                          title="Деталі"
                          onClick={() => navigate(`/operator/shipment/${shipment.id}`)}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                    За вашим запитом нічого не знайдено.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredAndSorted.length > 0 && (
          <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100">
            <Pagination
              activePage={activePage}
              endIndex={endIndex}
              itemLabel="відправлень"
              onPageChange={setCurrentPage}
              pageNumbers={pageNumbers}
              startIndex={startIndex}
              totalItems={totalItems}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorShipmentsPage;
