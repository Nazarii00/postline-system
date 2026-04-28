import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  MapPin,
  Package,
  RefreshCcw,
  Route,
  Truck,
  Wallet,
} from 'lucide-react';
import { api } from '../../services/api';
import type {
  CourierBreakdownItem,
  DepartmentBreakdownItem,
  OverviewReport,
  ReportShipment,
  RouteBreakdownItem,
  StatusBreakdownItem,
  TypeBreakdownItem,
} from '../../types/reports';
import type { Department } from '../../types/shipment';

const statusLabels: Record<string, string> = {
  accepted: 'Прийнято',
  sorting: 'На сортуванні',
  in_transit: 'В дорозі',
  arrived: 'У відділенні',
  ready_for_pickup: 'Готове до видачі',
  delivered: 'Доставлено',
  returned: 'Повернуто',
  cancelled: 'Скасовано',
};

const typeLabels: Record<string, string> = {
  letter: 'Лист',
  parcel: 'Посилка',
  package: 'Бандероль',
};

const initialFilters = {
  dateFrom: '',
  dateTo: '',
  status: 'all',
  shipmentType: 'all',
  departmentId: 'all',
  cityFrom: 'all',
  cityTo: 'all',
};

const formatMoney = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value: number | string | null | undefined, digits = 0) =>
  new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: digits,
  }).format(Number(value || 0));

const formatDate = (value: string) =>
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

const buildCsvReport = (report: OverviewReport) => {
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

type SummaryCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
};

const SummaryCard = ({ icon, label, value, hint }: SummaryCardProps) => (
  <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[156px] flex flex-col">
    <div className="w-11 h-11 rounded-xl bg-pine/10 text-pine flex items-center justify-center mb-4">
      {icon}
    </div>
    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    <p className="text-sm font-semibold text-slate-600 mt-auto pt-3">{label}</p>
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </article>
);

const EmptyBlock = ({ message }: { message: string }) => (
  <div className="p-8 text-center text-sm font-semibold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
    {message}
  </div>
);

const CARD_PAGE_SIZE = 4;

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

const PaginationControls = ({ page, pageSize, totalItems, onPageChange }: PaginationControlsProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className="px-4 pb-4 pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
      <p className="text-xs font-bold text-slate-400">
        {from}-{to} з {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          title="Попередня сторінка"
          aria-label="Попередня сторінка"
          disabled={!canGoBack}
          onClick={() => onPageChange(page - 1)}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
            canGoBack
              ? 'border-slate-200 text-slate-600 hover:border-pine hover:text-pine'
              : 'border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={17} />
        </button>
        <span className="min-w-[70px] text-center text-xs font-black text-slate-600">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          title="Наступна сторінка"
          aria-label="Наступна сторінка"
          disabled={!canGoForward}
          onClick={() => onPageChange(page + 1)}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
            canGoForward
              ? 'border-slate-200 text-slate-600 hover:border-pine hover:text-pine'
              : 'border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
};

const RevenueChart = ({ items }: { items: OverviewReport['revenueByDay'] }) => {
  const width = 760;
  const height = 280;
  const padding = { top: 24, right: 28, bottom: 46, left: 58 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxRevenue = Math.max(...items.map((item) => Number(item.revenue)), 1);
  const totalRevenue = items.reduce((sum, item) => sum + Number(item.revenue), 0);
  const totalShipments = items.reduce((sum, item) => sum + Number(item.shipments), 0);
  const bestDay = items.reduce(
    (best, item) => (Number(item.revenue) > Number(best.revenue) ? item : best),
    items[0]
  );
  const getX = (index: number) =>
    items.length === 1
      ? padding.left + chartWidth / 2
      : padding.left + (index / (items.length - 1)) * chartWidth;
  const getY = (revenue: number) =>
    padding.top + chartHeight - (revenue / maxRevenue) * chartHeight;
  const barWidth = Math.max(4, Math.min(20, (chartWidth / items.length) * 0.52));
  const linePoints = items
    .map((item, index) => `${getX(index)},${getY(Number(item.revenue))}`)
    .join(' ');
  const areaPoints = `${padding.left},${padding.top + chartHeight} ${linePoints} ${
    padding.left + chartWidth
  },${padding.top + chartHeight}`;
  const labelIndexes = [...new Set([0, Math.floor((items.length - 1) / 2), items.length - 1])];
  const gridValues = [maxRevenue, maxRevenue * 0.66, maxRevenue * 0.33, 0];

  return (
    <div>
      <div className="w-full h-[280px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Динаміка виторгу"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {gridValues.map((value) => {
            const y = getY(value);
            return (
              <g key={value}>
                <line
                  x1={padding.left}
                  x2={padding.left + chartWidth}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={value === 0 ? '0' : '4 8'}
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-bold"
                >
                  {formatMoney(value)}
                </text>
              </g>
            );
          })}

          <polygon points={areaPoints} fill="rgba(35, 99, 80, 0.10)" />

          {items.map((item, index) => {
            const revenue = Number(item.revenue);
            const x = getX(index);
            const y = getY(revenue);
            const barHeight = padding.top + chartHeight - y;

            return (
              <g key={item.day}>
                <rect
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={Math.max(3, barHeight)}
                  rx="4"
                  fill="rgba(35, 99, 80, 0.32)"
                >
                  <title>{`${formatMoney(item.revenue)} · ${item.shipments} відпр.`}</title>
                </rect>
              </g>
            );
          })}

          <polyline points={linePoints} fill="none" stroke="#236350" strokeWidth="4" strokeLinecap="round" />

          {items.map((item, index) => (
            <circle
              key={`${item.day}-point`}
              cx={getX(index)}
              cy={getY(Number(item.revenue))}
              r="4"
              className="fill-white"
              stroke="#236350"
              strokeWidth="3"
            >
              <title>{`${formatMoney(item.revenue)} · ${item.shipments} відпр.`}</title>
            </circle>
          ))}

          {labelIndexes.map((index) => (
            <text
              key={items[index].day}
              x={getX(index)}
              y={height - 16}
              textAnchor="middle"
              className="fill-slate-400 text-[11px] font-black"
            >
              {new Date(items[index].day).toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
              })}
            </text>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <p className="text-[11px] uppercase tracking-wider font-black text-slate-400">Всього</p>
          <p className="text-base font-black text-slate-900 mt-1">{formatMoney(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <p className="text-[11px] uppercase tracking-wider font-black text-slate-400">Відправлень</p>
          <p className="text-base font-black text-slate-900 mt-1">{formatNumber(totalShipments)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <p className="text-[11px] uppercase tracking-wider font-black text-slate-400">Пік дня</p>
          <p className="text-base font-black text-slate-900 mt-1">{formatMoney(bestDay.revenue)}</p>
        </div>
      </div>
    </div>
  );
};

const ReportsPage = () => {
  const [report, setReport] = useState<OverviewReport | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const departmentCities = useMemo(
    () => [...new Set(departments.map((department) => department.city))].sort(),
    [departments]
  );

  const reportQuery = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
    });

    return params.toString();
  }, [filters]);

  useEffect(() => {
    api.get<{ data: Department[] }>('/departments')
      .then((res) => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    api.get<{ data: OverviewReport }>(`/reports/overview${reportQuery ? `?${reportQuery}` : ''}`)
      .then((res) => {
        setReport(res.data);
        setError(null);
      })
      .catch((err) => {
        setReport(null);
        setError(err instanceof Error ? err.message : 'Не вдалося завантажити аналітику');
      })
      .finally(() => setIsLoading(false));
  }, [reportQuery]);

  const maxStatusCount = useMemo(
    () => Math.max(...(report?.statusBreakdown.map((item) => Number(item.count)) ?? [0]), 1),
    [report]
  );

  const updateFilter = (key: keyof typeof filters, value: string) => {
    if (filters[key] === value) return;
    setIsLoading(true);
    setError(null);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    const isAlreadyReset = Object.entries(initialFilters).every(
      ([key, value]) => filters[key as keyof typeof filters] === value
    );
    if (isAlreadyReset) return;

    setIsLoading(true);
    setError(null);
    setFilters(initialFilters);
  };

  const exportCsvReport = () => {
    if (!report) {
      setError('Немає даних для експорту');
      return;
    }

    const csv = buildCsvReport(report);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `postline-analytics-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const hasData = Boolean(report && report.summary.shipment_count > 0);

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 min-h-[104px]">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Аналітика та звіти
            </h1>
            <p className="text-slate-500 text-lg mt-3">
              Фінанси, статуси, маршрути, відділення та кур'єрська ефективність.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:border-slate-300 transition-colors"
            >
              <RefreshCcw size={18} />
              Скинути
            </button>
            <button
              type="button"
              onClick={exportCsvReport}
              disabled={!hasData}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-md whitespace-nowrap transition-colors ${
                hasData
                  ? 'bg-pine text-white hover:bg-pine/90'
                  : 'bg-pine/60 text-white cursor-not-allowed'
              }`}
            >
              <Download size={18} />
              Експорт CSV
            </button>
          </div>
        </div>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 text-sm font-black text-slate-700 mb-4">
            <Filter size={18} className="text-pine" />
            Фільтри звіту
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter('dateFrom', event.target.value)}
              max={filters.dateTo || today}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter('dateTo', event.target.value)}
              min={filters.dateFrom || undefined}
              max={today}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
            />
            <select
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
            >
              <option value="all">Усі статуси</option>
              {Object.entries(statusLabels).map(([status, label]) => (
                <option key={status} value={status}>{label}</option>
              ))}
            </select>
            <select
              value={filters.shipmentType}
              onChange={(event) => updateFilter('shipmentType', event.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
            >
              <option value="all">Усі типи</option>
              {Object.entries(typeLabels).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <select
              value={filters.departmentId}
              onChange={(event) => updateFilter('departmentId', event.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
            >
              <option value="all">Усі відділення</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.city}, {department.address}
                </option>
              ))}
            </select>
            <select
              value={filters.cityFrom}
              onChange={(event) => updateFilter('cityFrom', event.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
            >
              <option value="all">Звідки: усі</option>
              {departmentCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={filters.cityTo}
              onChange={(event) => updateFilter('cityTo', event.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
            >
              <option value="all">Куди: усі</option>
              {departmentCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-medium">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="p-12 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-200">
            Завантаження аналітики...
          </div>
        )}

        {!isLoading && report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <SummaryCard
                icon={<Wallet size={24} />}
                label="Загальний виторг"
                value={formatMoney(report.summary.total_revenue)}
                hint={`Середній чек: ${formatMoney(report.summary.average_check)}`}
              />
              <SummaryCard
                icon={<Package size={24} />}
                label="Відправлень"
                value={formatNumber(report.summary.shipment_count)}
                hint={`Активних: ${formatNumber(report.summary.active_count)}`}
              />
              <SummaryCard
                icon={<Activity size={24} />}
                label="Успішність доставки"
                value={`${formatNumber(report.summary.delivery_rate, 1)}%`}
                hint={`Доставлено: ${formatNumber(report.summary.delivered_count)}`}
              />
              <SummaryCard
                icon={<Truck size={24} />}
                label="Кур'єрські доставки"
                value={formatNumber(report.summary.courier_shipments)}
                hint={`Невдалих спроб: ${formatNumber(report.summary.failed_courier_attempts)}`}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
              <section className="xl:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[380px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <BarChart3 size={20} className="text-pine" />
                    Динаміка виторгу
                  </h2>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {report.revenueByDay.length} дн.
                  </span>
                </div>
                {report.revenueByDay.length === 0 ? (
                  <EmptyBlock message="За обраними фільтрами немає динаміки." />
                ) : (
                  <RevenueChart items={report.revenueByDay} />
                )}
              </section>

              <section className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="font-black text-slate-900 text-lg flex items-center gap-2 mb-6">
                  <FileText size={20} className="text-pine" />
                  Статуси
                </h2>
                {report.statusBreakdown.length === 0 ? (
                  <EmptyBlock message="Немає статусів для показу." />
                ) : (
                  <div className="space-y-4">
                    {report.statusBreakdown.map((item: StatusBreakdownItem) => (
                      <div key={item.status}>
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <span className="text-sm font-bold text-slate-700">
                            {statusLabels[item.status] ?? item.status}
                          </span>
                          <span className="text-sm font-black text-slate-900">{item.count}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pine rounded-full"
                            style={{ width: `${Math.max(4, (item.count / maxStatusCount) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{formatMoney(item.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              <ReportTable
                title="Типи відправлень"
                icon={<Package size={20} className="text-pine" />}
                headers={['Тип', 'К-сть', 'Вага', 'Виторг']}
                rows={report.typeBreakdown.map((item: TypeBreakdownItem) => [
                  typeLabels[item.shipment_type] ?? item.shipment_type,
                  formatNumber(item.count),
                  `${formatNumber(item.weight_kg, 1)} кг`,
                  formatMoney(item.revenue),
                ])}
              />
              <ReportTable
                title="Відділення"
                icon={<MapPin size={20} className="text-pine" />}
                headers={['Відділення', 'Відпр.', 'Готові', 'Виторг']}
                rows={report.departmentBreakdown.map((item: DepartmentBreakdownItem) => [
                  `${item.city ?? 'Невідомо'}, ${item.address ?? '-'}`,
                  formatNumber(item.shipments),
                  formatNumber(item.ready_for_pickup),
                  formatMoney(item.revenue),
                ])}
              />
              <ReportTable
                title="Кур'єри"
                icon={<Truck size={20} className="text-pine" />}
                headers={['Курʼєр', 'Активні', 'Вручено', 'Успіх']}
                rows={report.courierBreakdown.map((item: CourierBreakdownItem) => [
                  item.courier_name ?? 'Не призначено',
                  formatNumber(item.assigned + item.in_progress),
                  formatNumber(item.delivered),
                  `${formatNumber(item.success_rate, 1)}%`,
                ])}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <ReportTable
                title="Топ маршрутів"
                icon={<Route size={20} className="text-pine" />}
                headers={['Маршрут', 'К-сть', 'Сер. чек', 'Виторг']}
                rows={report.routeBreakdown.map((item: RouteBreakdownItem) => [
                  `${item.origin_city} → ${item.dest_city}`,
                  formatNumber(item.shipments),
                  formatMoney(item.average_cost),
                  formatMoney(item.revenue),
                ])}
              />

              <RecentShipmentsTable shipments={report.recentShipments} />
            </div>
          </>
        )}
      </section>
    </main>
  );
};

type ReportTableProps = {
  title: string;
  icon: ReactNode;
  headers: string[];
  rows: string[][];
  pageSize?: number;
};

const ReportTable = ({ title, icon, headers, rows, pageSize = CARD_PAGE_SIZE }: ReportTableProps) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRows = rows.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        {icon}
        <h2 className="font-black text-slate-900 text-lg">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyBlock message="Немає даних для показу." />
        </div>
      ) : (
        <>
          <div className="p-4 space-y-3">
            {visibleRows.map((row, rowIndex) => {
              const [primary, ...values] = row;
              const itemIndex = startIndex + rowIndex;

              return (
                <article
                  key={`${title}-${itemIndex}`}
                  className="rounded-2xl bg-slate-50 border border-slate-100 p-4 min-w-0"
                >
                  <p className="text-sm font-black text-slate-900 leading-snug break-words">
                    {primary}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-4">
                    {values.map((cell, valueIndex) => (
                      <div key={`${title}-${itemIndex}-${valueIndex}`} className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                          {headers[valueIndex + 1]}
                        </p>
                        <p className="text-sm font-bold text-slate-700 mt-1 break-words">
                          {cell}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          <PaginationControls
            page={currentPage}
            pageSize={pageSize}
            totalItems={rows.length}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
};

const RecentShipmentsTable = ({ shipments }: { shipments: ReportShipment[] }) => {
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

export default ReportsPage;
