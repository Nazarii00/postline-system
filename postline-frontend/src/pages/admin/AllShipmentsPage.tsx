import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Package,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import type { Shipment } from '../../types/shipment';
import { INPUT_LIMITS, sanitizePlainText } from '../../utils/formUtils';

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

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'in_transit':
      return 'bg-pine/10 text-pine border-pine/20';
    case 'accepted':
    case 'sorting':
    case 'arrived':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'cancelled':
      return 'bg-red-50 text-red-500 border-red-100';
    case 'returned':
      return 'bg-orange-50 text-orange-500 border-orange-100';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-100';
  }
};

const PAGE_SIZE = 20;

type SortConfig = { key: keyof Shipment | null; direction: 'asc' | 'desc' };

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

const AllShipmentsPage = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError('');
      })
      .catch(() => setError('Не вдалося завантажити відправлення'))
      .finally(() => setIsLoading(false));
  }, [searchTerm, statusFilter, sortConfig]);

  const handleSort = (key: keyof Shipment) => {
    setCurrentPage(1);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filtered = useMemo(() => {
    let result = [...shipments];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((s) =>
        s.tracking_number.toLowerCase().includes(lower) ||
        s.sender_name?.toLowerCase().includes(lower) ||
        s.receiver_name?.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    return result;
  }, [shipments, searchTerm, statusFilter]);

  const {
    activePage,
    endIndex,
    pageNumbers,
    paginatedItems: paginated,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  } = usePagination(filtered, PAGE_SIZE);

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Реєстр відправлень
            </h1>
            <p className="text-slate-500 text-base mt-2">
              Повний список та історія всіх посилок PostLine
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-pine transition-colors" />
              <input
                type="text"
                placeholder="Номер ТТН або ПІБ..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(sanitizePlainText(e.target.value, INPUT_LIMITS.nameMax));
                  setCurrentPage(1);
                }}
                maxLength={INPUT_LIMITS.nameMax}
                className="pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:border-pine outline-none shadow-sm transition-all w-full sm:w-80"
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-pine shadow-sm appearance-none cursor-pointer"
              >
                <option value="all">Всі статуси</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    { label: 'Інформація', key: 'tracking_number' },
                    { label: 'Учасники', key: 'sender_name' },
                    { label: 'Маршрут / Дата', key: 'created_at' },
                    { label: 'Статус', key: 'status' },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key as keyof Shipment)}
                      className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    >
                      <div className="flex items-center gap-2">
                        {label}
                        <SortIcon columnKey={key as keyof Shipment} sortConfig={sortConfig} />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-sm text-slate-500 text-center">
                      Завантаження відправлень...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-sm text-slate-500 text-center">
                      Відправлень за обраними умовами не знайдено.
                    </td>
                  </tr>
                ) : paginated.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/admin/shipment/${s.id}`)}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-pine/10 flex items-center justify-center text-pine">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 tracking-tight text-base">
                            {s.tracking_number}
                          </p>
                          <p className="text-xs font-semibold text-slate-500 uppercase mt-1">
                            {TYPE_LABELS[s.shipment_type] ?? s.shipment_type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-2.5">
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-slate-300" /> {s.sender_name}
                        </p>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-pine" /> {s.receiver_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">
                          {s.origin_city} to {s.dest_city}
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(s.created_at).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusStyle(s.status)}`}>
                        {STATUS_LABELS[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-pine/20 group-hover:bg-pine/5 group-hover:text-pine transition-all ml-auto">
                        <ChevronRight size={20} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalItems > 0 && (
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
      </section>
    </main>
  );
};

export default AllShipmentsPage;
