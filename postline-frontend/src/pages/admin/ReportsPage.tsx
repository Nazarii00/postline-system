import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Wallet,
  Download,
  Calendar,
  Package,
  FileText,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import type { ReportMetrics, ReportShipment } from '../../types/reports';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(value);

const getLastSevenDays = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });
};

const statusLabels: Record<string, string> = {
  accepted: 'Прийнято',
  sorted: 'Відсортовано',
  in_transit: 'В дорозі',
  arrived: 'Прибуло',
  ready_for_pickup: 'Готове до видачі',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));

const escapeCsvCell = (value: string | number | null | undefined) => {
  const normalized = value === null || value === undefined ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

const buildCsvReport = (shipments: ReportShipment[], metrics: ReportMetrics) => {
  const rows: Array<Array<string | number>> = [
    ['Звіт PostLine'],
    ['Дата формування', formatDate(new Date().toISOString())],
    ['Загальний виторг', metrics.totalRevenue],
    ['Кількість відправлень', metrics.shipmentCount],
    ['Середній чек', Math.round(metrics.averageCheck * 100) / 100],
    [],
    ['ТТН', 'Статус', 'Тип', 'Вага, кг', 'Відправник', 'Отримувач', 'Звідки', 'Куди', 'Вартість', 'Дата створення'],
    ...shipments.map((shipment) => [
      shipment.tracking_number ?? shipment.id,
      shipment.status ? statusLabels[shipment.status] ?? shipment.status : '',
      shipment.shipment_type ?? '',
      shipment.weight_kg ?? '',
      shipment.sender_name ?? '',
      shipment.receiver_name ?? '',
      shipment.origin_city ?? '',
      shipment.dest_city ?? '',
      Number(shipment.total_cost || 0),
      formatDate(shipment.created_at),
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n');
};

const ReportsPage = () => {
  const [shipments, setShipments] = useState<ReportShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ data: ReportShipment[] }>('/shipments')
      .then((res) => setShipments(res.data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Не вдалося завантажити звітні дані');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const metrics = useMemo<ReportMetrics>(() => {
    const totalRevenue = shipments.reduce((sum, shipment) => sum + Number(shipment.total_cost || 0), 0);
    const averageCheck = shipments.length ? totalRevenue / shipments.length : 0;

    const days = getLastSevenDays();
    const dailyRevenue = days.map((day) => {
      const dayKey = day.toDateString();
      return shipments
        .filter((shipment) => new Date(shipment.created_at).toDateString() === dayKey)
        .reduce((sum, shipment) => sum + Number(shipment.total_cost || 0), 0);
    });
    const maxDailyRevenue = Math.max(...dailyRevenue, 1);

    return {
      totalRevenue,
      averageCheck,
      shipmentCount: shipments.length,
      chart: days.map((day, index) => ({
        label: day.toLocaleDateString('uk-UA', { weekday: 'short' }),
        height: Math.max(8, Math.round((dailyRevenue[index] / maxDailyRevenue) * 100)),
      })),
    };
  }, [shipments]);

  const exportCsvReport = () => {
    if (shipments.length === 0) {
      setError('Немає даних для експорту');
      return;
    }

    const csv = buildCsvReport(shipments, metrics);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `postline-report-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const canExport = !isLoading && shipments.length > 0;

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-h-[104px]">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Аналітика та звіти
            </h1>
            <p className="text-slate-500 text-lg mt-3">
              Фінансові показники та ефективність логістики
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              <Calendar size={18} />
              <span>Усі доступні дані</span>
            </button>
            <button
              onClick={exportCsvReport}
              disabled={!canExport}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-md whitespace-nowrap transition-colors ${
                canExport
                  ? 'bg-pine text-white hover:bg-pine/90'
                  : 'bg-pine/60 text-white cursor-not-allowed'
              }`}
              title={canExport ? 'Завантажити CSV-звіт' : 'Немає даних для експорту'}
            >
              <Download size={18} />
              <span>Експорт</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[160px] flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-pine/10 text-pine flex items-center justify-center mb-4">
              <Wallet size={24} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? '...' : formatMoney(metrics.totalRevenue)}
            </p>
            <p className="text-sm font-semibold text-slate-600 mt-2 mt-auto">Загальний виторг</p>
          </article>

          <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[160px] flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-pine/10 text-pine flex items-center justify-center mb-4">
              <Package size={24} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? '...' : metrics.shipmentCount}
            </p>
            <p className="text-sm font-semibold text-slate-600 mt-2 mt-auto">Відправлень за період</p>
          </article>

          <article className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[160px] flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-pine/10 text-pine flex items-center justify-center mb-4">
              <BarChart3 size={24} />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? '...' : formatMoney(metrics.averageCheck)}
            </p>
            <p className="text-sm font-semibold text-slate-600 mt-2 mt-auto">Середній чек</p>
          </article>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[360px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-900 text-lg">Динаміка виторгу</h3>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-pine" />
                <span className="w-3 h-3 rounded-full bg-slate-300" />
              </div>
            </div>
            <div className="flex-1 border-b border-l border-slate-100 relative flex items-end justify-between px-4 pb-2">
              {metrics.chart.map((bar) => (
                <div
                  key={bar.label}
                  style={{ height: `${bar.height}%` }}
                  className="w-8 bg-slate-200 rounded-t-lg hover:bg-pine/70 transition-colors"
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2">
              {metrics.chart.map((bar) => (
                <span key={bar.label} className="text-xs font-semibold text-slate-500 capitalize">{bar.label}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Готові звіти</h3>
              <Filter size={18} className="text-slate-400" />
            </div>
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-pine flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <p className="text-sm font-bold text-slate-800">CSV-звіт готовий до формування</p>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                CSV-звіт формується з поточного списку відправлень і готовий до завантаження одразу з браузера.
              </p>
            </div>
            <div className="p-6 border-t border-slate-100">
              <button
                onClick={exportCsvReport}
                disabled={!canExport}
                className={`w-full py-3 border rounded-2xl text-sm font-bold transition-colors ${
                  canExport
                    ? 'border-pine/30 text-pine hover:bg-pine/5'
                    : 'border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Згенерувати CSV-звіт
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ReportsPage;
