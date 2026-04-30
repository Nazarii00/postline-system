import { MapPin, Phone } from 'lucide-react';
import { Pagination } from '../../ui/Pagination';
import type { ReadyForCourierShipment } from '../../../types/courier';
import {
  getCourierShipmentReadiness,
  isCourierShipmentAssignable,
} from './courierDeliveryUtils';

type PaginationState = {
  activePage: number;
  endIndex: number;
  pageNumbers: (number | string)[];
  setCurrentPage: (page: number) => void;
  startIndex: number;
  totalItems: number;
  totalPages: number;
};

type AssignableShipmentsSectionProps = {
  isLoading: boolean;
  shipments: ReadyForCourierShipment[];
  paginatedShipments: ReadyForCourierShipment[];
  pagination: PaginationState;
  onStartAssign: (shipment: ReadyForCourierShipment) => void;
};

export const AssignableShipmentsSection = ({
  isLoading,
  shipments,
  paginatedShipments,
  pagination,
  onStartAssign,
}: AssignableShipmentsSectionProps) => (
  <div>
    <h2 className="text-lg font-black text-slate-700 mb-4">
      Кур'єрські відправлення
    </h2>

    {isLoading ? (
      <div className="p-8 text-center text-slate-400">Завантаження...</div>
    ) : shipments.length === 0 ? (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 font-medium">
        Немає кур'єрських відправлень для вашого кінцевого відділення
      </div>
    ) : (
      <div className="space-y-4">
        {paginatedShipments.map((shipment) => {
          const isAssignable = isCourierShipmentAssignable(shipment);
          const readiness = getCourierShipmentReadiness(shipment);

          return (
            <div
              key={shipment.id}
              className={`bg-white p-6 rounded-3xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                isAssignable
                  ? 'border-slate-200 hover:shadow-lg hover:border-slate-300'
                  : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="font-bold text-slate-900 text-lg">{shipment.tracking_number}</span>
                  <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${readiness.className}`}>
                    {readiness.label}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-700 flex items-start gap-2 font-medium">
                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    {shipment.receiver_address || shipment.dest_city}
                  </p>
                  <p className="text-sm text-slate-700 flex items-center gap-2 font-medium">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    {shipment.receiver_phone}
                    <span className="text-slate-500 font-normal">({shipment.receiver_name})</span>
                  </p>
                  {!isAssignable && (
                    <p className="text-xs text-slate-500 font-medium">
                      {readiness.reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <button
                  disabled={!isAssignable}
                  title={isAssignable ? undefined : readiness.reason}
                  onClick={() => {
                    if (!isAssignable) return;
                    onStartAssign(shipment);
                  }}
                  className={`w-full md:w-auto px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isAssignable
                      ? 'bg-pine text-white hover:bg-pine/90 active:scale-95 shadow-lg'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isAssignable ? "Призначити кур'єра" : 'Очікує готовності'}
                </button>
              </div>
            </div>
          );
        })}
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
