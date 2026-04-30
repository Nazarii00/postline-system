import type { Shipment } from './statusChangeTypes';

const DESTINATION_STATUSES = new Set(['arrived', 'ready_for_pickup', 'delivered']);

export const STATUS_LABELS: Record<string, string> = {
  accepted: 'Прийнято',
  sorting: 'На сортуванні',
  in_transit: 'В дорозі',
  arrived: 'У відділенні',
  ready_for_pickup: 'Готове до видачі',
  delivered: 'Видано',
  returned: 'Повернуто',
  cancelled: 'Скасовано',
};

export const getStatusActionLabel = (shipment: Shipment, status: string) => {
  if (status === 'returned') {
    return 'Повернути відправлення';
  }

  if (shipment.status === 'sorting' && status === 'in_transit') {
    return shipment.current_dept_id === shipment.dest_dept_id
      ? 'Передати до видачі'
      : 'Відправити до наступної точки';
  }

  if (shipment.status === 'in_transit' && status === 'in_transit') {
    return 'Обробити транзит і відправити далі';
  }

  return STATUS_LABELS[status] ?? status;
};

export const getWorkflowStatuses = (shipment: Shipment) => {
  switch (shipment.status) {
    case 'accepted':
      return ['sorting'];
    case 'sorting':
      return ['in_transit', 'returned'];
    case 'in_transit':
      return Number(shipment.current_dept_id) === Number(shipment.dest_dept_id)
        ? ['arrived', 'returned']
        : ['in_transit', 'returned'];
    case 'arrived':
      return ['ready_for_pickup', 'returned'];
    case 'ready_for_pickup':
      return ['delivered', 'returned'];
    default:
      return [];
  }
};

export const getBadgeClass = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700';
    case 'ready_for_pickup':
      return 'bg-blue-100 text-blue-700';
    case 'in_transit':
      return 'bg-amber-100 text-amber-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export const canApplyStatusInDepartment = (
  shipment: Shipment,
  nextStatus: string,
  departmentId?: number | null,
) => {
  if (!departmentId) return true;

  const targetDepartmentId = DESTINATION_STATUSES.has(nextStatus)
    ? shipment.dest_dept_id
    : shipment.current_dept_id;

  return Number(targetDepartmentId) === Number(departmentId);
};
