import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientShipmentFilters } from '../../components/client/dashboard/ClientShipmentFilters';
import { ClientShipmentsTable } from '../../components/client/dashboard/ClientShipmentsTable';
import {
  CLIENT_SHIPMENTS_PER_PAGE,
  sortShipments,
  type SortConfig,
} from '../../components/client/dashboard/clientDashboardUtils';
import { usePagination } from '../../hooks/usePagination';
import { api } from '../../services/api';
import type { Shipment } from '../../types/shipment';

const ClientDashboard = () => {
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

    return sortShipments(result, sortConfig);
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
  } = usePagination(filteredAndSorted, CLIENT_SHIPMENTS_PER_PAGE);

  const handleSort = (key: keyof Shipment) => {
    setCurrentPage(1);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

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

      <ClientShipmentFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchTermChange={handleSearchTermChange}
        onStatusFilterChange={handleStatusFilterChange}
      />

      <ClientShipmentsTable
        isLoading={isLoading}
        error={error}
        filteredShipmentsCount={filteredAndSorted.length}
        paginatedShipments={paginatedShipments}
        sortConfig={sortConfig}
        pagination={{
          activePage,
          endIndex,
          pageNumbers,
          setCurrentPage,
          startIndex,
          totalItems,
          totalPages,
        }}
        onSort={handleSort}
        onOpenShipment={(shipmentId) => navigate(`/client/shipment/${shipmentId}`)}
      />
    </div>
  );
};

export default ClientDashboard;
