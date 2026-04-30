import { MapPin, UserCheck } from 'lucide-react';
import { Pagination } from '../../ui/Pagination';
import type { CourierDelivery } from '../../../types/courier';
import { hasConfirmedRoute } from './courierDeliveryUtils';

type PaginationState = {
  activePage: number;
  endIndex: number;
  pageNumbers: (number | string)[];
  setCurrentPage: (page: number) => void;
  startIndex: number;
  totalItems: number;
  totalPages: number;
};

type ActiveDeliveriesSectionProps = {
  isLoading: boolean;
  deliveries: CourierDelivery[];
  paginatedDeliveries: CourierDelivery[];
  selectedDeliveryIdSet: Set<number>;
  pagination: PaginationState;
  getDeliverySelectionBlockReason: (delivery: CourierDelivery) => string;
  onToggleDeliverySelection: (delivery: CourierDelivery) => void;
  onUpdateStatus: (deliveryId: number, status: 'delivered' | 'failed', failureReason?: string) => void;
};

export const ActiveDeliveriesSection = ({
  isLoading,
  deliveries,
  paginatedDeliveries,
  selectedDeliveryIdSet,
  pagination,
  getDeliverySelectionBlockReason,
  onToggleDeliverySelection,
  onUpdateStatus,
}: ActiveDeliveriesSectionProps) => (
  <div>
    <h2 className="text-lg font-black text-slate-700 mb-4">Активні доставки</h2>
    {isLoading ? (
      <div className="p-8 text-center text-slate-400">Завантаження...</div>
    ) : deliveries.length === 0 ? (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 font-medium">
        Активних кур'єрських доставок немає
      </div>
    ) : (
      <div className="space-y-4">
        {paginatedDeliveries.map((delivery) => {
          const selectionBlockReason = getDeliverySelectionBlockReason(delivery);
          const isSelectable = !selectionBlockReason;
          const isSelected = selectedDeliveryIdSet.has(delivery.id);

          return (
            <div
              key={delivery.id}
              className={`bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                isSelected ? 'border-pine ring-2 ring-pine/10' : 'border-amber-200'
              }`}
            >
              <div className="flex gap-4 flex-1">
                <label className={`pt-1 ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isSelectable}
                    onChange={() => onToggleDeliverySelection(delivery)}
                    className="w-5 h-5 rounded border-slate-300 accent-pine"
                  />
                </label>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-bold text-slate-900">{delivery.tracking_number}</span>
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase ${
                      delivery.status === 'in_progress'
                        ? 'bg-emerald-100 text-emerald-700'
                        : hasConfirmedRoute(delivery)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-600'
                    }`}>
                      {delivery.status === 'in_progress'
                        ? 'Відвідано кур’єром'
                        : hasConfirmedRoute(delivery)
                          ? 'Маршрут підтверджено'
                          : 'Призначено'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 flex items-start gap-2">
                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    {delivery.to_address}
                  </p>
                  {delivery.courier_name && (
                    <p className="text-sm text-slate-600 flex items-center gap-2 mt-2 font-medium">
                      <UserCheck size={16} className="text-emerald-500" />
                      {delivery.courier_name}
                    </p>
                  )}
                  {!isSelectable && (
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      {selectionBlockReason}
                    </p>
                  )}
                </div>
              </div>

              {delivery.status === 'in_progress' ? (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onUpdateStatus(delivery.id, 'delivered')}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all"
                  >
                    Вручено
                  </button>
                  <button
                    onClick={() => onUpdateStatus(delivery.id, 'failed', 'Клієнта немає на місці')}
                    className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-200 transition-all"
                  >
                    Невдача
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold shrink-0">
                  Очікує відвідування
                </div>
              )}
            </div>
          );
        })}
        <Pagination
          activePage={pagination.activePage}
          endIndex={pagination.endIndex}
          itemLabel="доставок"
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
