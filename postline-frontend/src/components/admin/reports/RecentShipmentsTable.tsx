import { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { ReportShipment } from '../../../types/reports';
import { EmptyBlock } from './EmptyBlock';
import { PaginationControls } from './PaginationControls';
import { CARD_PAGE_SIZE } from './ReportTable';
import {
  formatDate,
  formatMoney,
  statusLabels,
  typeLabels,
} from './reportUtils';

export const RecentShipmentsTable = ({ shipments }: { shipments: ReportShipment[] }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(shipments.length / CARD_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * CARD_PAGE_SIZE;
  const visibleShipments = shipments.slice(startIndex, startIndex + CARD_PAGE_SIZE);

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        <Calendar size={20} className="text-pine" />
        <h2 className="font-black text-slate-900 text-lg">Останні відправлення</h2>
      </div>
      {shipments.length === 0 ? (
        <div className="p-6">
          <EmptyBlock message="Останніх відправлень не знайдено." />
        </div>
      ) : (
        <>
          <div className="p-4 space-y-3">
            {visibleShipments.map((shipment) => (
              <article
                key={shipment.id}
                className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-base font-black text-pine break-words">{shipment.tracking_number}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                      {formatDate(shipment.created_at)}
                    </p>
                  </div>
                  <p className="text-base font-black text-slate-900">{formatMoney(shipment.total_cost)}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">Статус</p>
                    <p className="text-sm font-bold text-slate-700 mt-1 break-words">
                      {statusLabels[shipment.status] ?? shipment.status}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">Тип</p>
                    <p className="text-sm font-bold text-slate-700 mt-1 break-words">
                      {typeLabels[shipment.shipment_type] ?? shipment.shipment_type}
                    </p>
                  </div>
                  <div className="min-w-0 sm:col-span-1 col-span-2">
                    <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">Маршрут</p>
                    <p className="text-sm font-bold text-slate-700 mt-1 break-words">
                      {shipment.origin_city} → {shipment.dest_city}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <PaginationControls
            page={currentPage}
            pageSize={CARD_PAGE_SIZE}
            totalItems={shipments.length}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
};
