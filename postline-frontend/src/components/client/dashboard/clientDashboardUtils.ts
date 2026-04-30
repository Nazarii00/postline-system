import type { Shipment } from '../../../types/shipment';

export const CLIENT_SHIPMENTS_PER_PAGE = 10;

export const STATUS_LABELS: Record<string, string> = {
  accepted: 'Прийнято',
  sorting: 'На сортуванні',
  in_transit: 'В дорозі',
  arrived: 'У відділенні',
  ready_for_pickup: 'Готове до видачі',
  delivered: 'Доставлено',
  returned: 'Повернуто',
  cancelled: 'Скасовано',
};

export const TYPE_LABELS: Record<string, string> = {
  letter: 'Лист',
  parcel: 'Посилка',
  package: 'Бандероль',
};

export type SortConfig = {
  key: keyof Shipment | null;
  direction: 'asc' | 'desc';
};

export const getStatusBadge = (status: string) => {
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

export const sortShipments = (shipments: Shipment[], sortConfig: SortConfig) => {
  if (!sortConfig.key) return shipments;

  return [...shipments].sort((a, b) => {
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
};
