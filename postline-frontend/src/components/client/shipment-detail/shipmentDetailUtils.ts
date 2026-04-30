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

export const SIZE_LABELS: Record<string, string> = {
  S: 'Малий (S)',
  M: 'Середній (M)',
  L: 'Великий (L)',
  XL: 'Дуже великий (XL)',
};

export const getStatusColor = (status: string) => {
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

export const getTimelineDot = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'returned':
      return 'bg-orange-500';
    default:
      return 'bg-pine';
  }
};
