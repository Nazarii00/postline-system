import { Pagination } from '../../ui/Pagination';
import type { Shipment } from '../../../types/shipment';
import {
  getStatusBadge,
  STATUS_LABELS,
  TYPE_LABELS,
  type SortConfig,
} from './clientDashboardUtils';
import { SortIcon } from './SortIcon';

type ClientShipmentsTableProps = {
  isLoading: boolean;
  error: string;
  filteredShipmentsCount: number;
  paginatedShipments: Shipment[];
  sortConfig: SortConfig;
  pagination: {
    activePage: number;
    endIndex: number;
    pageNumbers: (number | string)[];
    setCurrentPage: (page: number) => void;
    startIndex: number;
    totalItems: number;
    totalPages: number;
  };
  onSort: (key: keyof Shipment) => void;
  onOpenShipment: (shipmentId: number) => void;
};

const columns: { key: keyof Shipment; label: string }[] = [
  { key: 'tracking_number', label: 'Трекінг-номер' },
  { key: 'created_at', label: 'Дата реєстрації' },
  { key: 'sender_name', label: 'Відправник' },
  { key: 'receiver_name', label: 'Одержувач' },
  { key: 'shipment_type', label: 'Тип' },
  { key: 'status', label: 'Статус' },
];

export const ClientShipmentsTable = ({
  isLoading,
  error,
  filteredShipmentsCount,
  paginatedShipments,
  sortConfig,
  pagination,
  onSort,
  onOpenShipment,
}: ClientShipmentsTableProps) => (
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
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => onSort(key)}
                  className="p-5 cursor-pointer hover:bg-slate-100/80 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {label}
                    <SortIcon columnKey={key} sortConfig={sortConfig} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredShipmentsCount > 0 ? (
              paginatedShipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  onClick={() => onOpenShipment(shipment.id)}
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
                  <td className="p-5 text-slate-600 text-sm">
                    {TYPE_LABELS[shipment.shipment_type] ?? shipment.shipment_type}
                  </td>
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
    {!isLoading && !error && filteredShipmentsCount > 0 && (
      <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100">
        <Pagination
          activePage={pagination.activePage}
          endIndex={pagination.endIndex}
          itemLabel="відправлень"
          onPageChange={pagination.setCurrentPage}
          pageNumbers={pagination.pageNumbers}
          startIndex={pagination.startIndex}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      </div>
    )}
  </div>
);
