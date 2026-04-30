import type { OverviewReport } from '../../../types/reports';
import { formatMoney, formatNumber } from './reportUtils';

export const RevenueChart = ({ items }: { items: OverviewReport['revenueByDay'] }) => {
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
