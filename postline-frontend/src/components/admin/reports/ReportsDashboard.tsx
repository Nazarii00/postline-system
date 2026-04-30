import {
  Activity,
  BarChart3,
  FileText,
  MapPin,
  Package,
  Route,
  Truck,
  Wallet,
} from 'lucide-react';
import type { OverviewReport } from '../../../types/reports';
import { EmptyBlock } from './EmptyBlock';
import { RecentShipmentsTable } from './RecentShipmentsTable';
import { ReportTable } from './ReportTable';
import { RevenueChart } from './RevenueChart';
import { SummaryCard } from './SummaryCard';
import {
  formatMoney,
  formatNumber,
  statusLabels,
  typeLabels,
} from './reportUtils';

type ReportsDashboardProps = {
  report: OverviewReport;
};

export const ReportsDashboard = ({ report }: ReportsDashboardProps) => {
  const maxStatusCount = Math.max(...report.statusBreakdown.map((item) => Number(item.count)), 1);

  return (
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
              {report.statusBreakdown.map((item) => (
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
          rows={report.typeBreakdown.map((item) => [
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
          rows={report.departmentBreakdown.map((item) => [
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
          rows={report.courierBreakdown.map((item) => [
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
          rows={report.routeBreakdown.map((item) => [
            `${item.origin_city} → ${item.dest_city}`,
            formatNumber(item.shipments),
            formatMoney(item.average_cost),
            formatMoney(item.revenue),
          ])}
        />

        <RecentShipmentsTable shipments={report.recentShipments} />
      </div>
    </>
  );
};
