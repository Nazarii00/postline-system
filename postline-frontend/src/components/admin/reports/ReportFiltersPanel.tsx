import { Filter } from 'lucide-react';
import type { Department } from '../../../types/shipment';
import {
  statusLabels,
  type ReportFilters,
  typeLabels,
} from './reportUtils';

type ReportFiltersPanelProps = {
  filters: ReportFilters;
  departments: Department[];
  departmentCities: string[];
  today: string;
  onFilterChange: (key: keyof ReportFilters, value: string) => void;
};

export const ReportFiltersPanel = ({
  filters,
  departments,
  departmentCities,
  today,
  onFilterChange,
}: ReportFiltersPanelProps) => (
  <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
    <div className="flex items-center gap-2 text-sm font-black text-slate-700 mb-4">
      <Filter size={18} className="text-pine" />
      Фільтри звіту
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      <input
        type="date"
        value={filters.dateFrom}
        onChange={(event) => onFilterChange('dateFrom', event.target.value)}
        max={filters.dateTo || today}
        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
      />
      <input
        type="date"
        value={filters.dateTo}
        onChange={(event) => onFilterChange('dateTo', event.target.value)}
        min={filters.dateFrom || undefined}
        max={today}
        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
      />
      <select
        value={filters.status}
        onChange={(event) => onFilterChange('status', event.target.value)}
        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
      >
        <option value="all">Усі статуси</option>
        {Object.entries(statusLabels).map(([status, label]) => (
          <option key={status} value={status}>{label}</option>
        ))}
      </select>
      <select
        value={filters.shipmentType}
        onChange={(event) => onFilterChange('shipmentType', event.target.value)}
        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
      >
        <option value="all">Усі типи</option>
        {Object.entries(typeLabels).map(([type, label]) => (
          <option key={type} value={type}>{label}</option>
        ))}
      </select>
      <select
        value={filters.departmentId}
        onChange={(event) => onFilterChange('departmentId', event.target.value)}
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
        onChange={(event) => onFilterChange('cityFrom', event.target.value)}
        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
      >
        <option value="all">Звідки: усі</option>
        {departmentCities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
      <select
        value={filters.cityTo}
        onChange={(event) => onFilterChange('cityTo', event.target.value)}
        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-pine"
      >
        <option value="all">Куди: усі</option>
        {departmentCities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  </section>
);
