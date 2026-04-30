import type { OverviewReport } from '../../../types/reports';

export const statusLabels: Record<string, string> = {
  accepted: 'Прийнято',
  sorting: 'На сортуванні',
  in_transit: 'В дорозі',
  arrived: 'У відділенні',
  ready_for_pickup: 'Готове до видачі',
  delivered: 'Доставлено',
  returned: 'Повернуто',
  cancelled: 'Скасовано',
};

export const typeLabels: Record<string, string> = {
  letter: 'Лист',
  parcel: 'Посилка',
  package: 'Бандероль',
};

export const initialFilters = {
  dateFrom: '',
  dateTo: '',
  status: 'all',
  shipmentType: 'all',
  departmentId: 'all',
  cityFrom: 'all',
  cityTo: 'all',
};

export type ReportFilters = typeof initialFilters;

export const formatMoney = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatNumber = (value: number | string | null | undefined, digits = 0) =>
  new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: digits,
  }).format(Number(value || 0));

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));

const escapeCsvCell = (value: string | number | null | undefined) => {
  const normalized = value === null || value === undefined ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

const buildCsvSection = (title: string, rows: Array<Array<string | number | null | undefined>>) => [
  [title],
  ...rows,
  [],
];

export const buildCsvReport = (report: OverviewReport) => {
  const rows: Array<Array<string | number | null | undefined>> = [
    ['Звіт PostLine'],
    ['Дата формування', formatDate(new Date().toISOString())],
    ['Відправлень', report.summary.shipment_count],
    ['Виторг', report.summary.total_revenue],
    ['Середній чек', report.summary.average_check],
    ['Відсоток доставлення', `${formatNumber(report.summary.delivery_rate, 1)}%`],
    [],
    ...buildCsvSection('Динаміка по днях', [
      ['Дата', 'Відправлень', 'Доставлено', 'Виторг'],
      ...report.revenueByDay.map((item) => [item.day, item.shipments, item.delivered, item.revenue]),
    ]),
    ...buildCsvSection('Статуси', [
      ['Статус', 'Кількість', 'Виторг'],
      ...report.statusBreakdown.map((item) => [statusLabels[item.status] ?? item.status, item.count, item.revenue]),
    ]),
    ...buildCsvSection('Типи відправлень', [
      ['Тип', 'Кількість', 'Вага, кг', 'Виторг'],
      ...report.typeBreakdown.map((item) => [typeLabels[item.shipment_type] ?? item.shipment_type, item.count, item.weight_kg, item.revenue]),
    ]),
    ...buildCsvSection('Топ маршрутів', [
      ['Звідки', 'Куди', 'Кількість', 'Середній чек', 'Виторг'],
      ...report.routeBreakdown.map((item) => [item.origin_city, item.dest_city, item.shipments, item.average_cost, item.revenue]),
    ]),
    ...buildCsvSection('Останні відправлення', [
      ['ТТН', 'Статус', 'Тип', 'Відправник', 'Одержувач', 'Звідки', 'Куди', 'Вартість', 'Дата'],
      ...report.recentShipments.map((shipment) => [
        shipment.tracking_number,
        statusLabels[shipment.status] ?? shipment.status,
        typeLabels[shipment.shipment_type] ?? shipment.shipment_type,
        shipment.sender_name,
        shipment.receiver_name,
        shipment.origin_city,
        shipment.dest_city,
        shipment.total_cost,
        formatDate(shipment.created_at),
      ]),
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n');
};
