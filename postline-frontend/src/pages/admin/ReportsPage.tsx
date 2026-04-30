import { useEffect, useMemo, useState } from 'react';
import { ReportFiltersPanel } from '../../components/admin/reports/ReportFiltersPanel';
import { ReportsDashboard } from '../../components/admin/reports/ReportsDashboard';
import { ReportsHeader } from '../../components/admin/reports/ReportsHeader';
import {
  buildCsvReport,
  initialFilters,
  type ReportFilters,
} from '../../components/admin/reports/reportUtils';
import { api } from '../../services/api';
import type { OverviewReport } from '../../types/reports';
import type { Department } from '../../types/shipment';

const ReportsPage = () => {
  const [report, setReport] = useState<OverviewReport | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
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

  const updateFilter = (key: keyof ReportFilters, value: string) => {
    if (filters[key] === value) return;
    setIsLoading(true);
    setError(null);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    const isAlreadyReset = Object.entries(initialFilters).every(
      ([key, value]) => filters[key as keyof ReportFilters] === value
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
        <ReportsHeader
          hasData={hasData}
          onResetFilters={resetFilters}
          onExportCsv={exportCsvReport}
        />

        <ReportFiltersPanel
          filters={filters}
          departments={departments}
          departmentCities={departmentCities}
          today={today}
          onFilterChange={updateFilter}
        />

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

        {!isLoading && report && <ReportsDashboard report={report} />}
      </section>
    </main>
  );
};

export default ReportsPage;
