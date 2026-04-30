import { useEffect, useState } from 'react';
import { Plus, Route } from 'lucide-react';
import { RouteCard } from '../../components/operator/routes/RouteCard';
import { RoutesCreateForm, type RouteDraftStop } from '../../components/operator/routes/RoutesCreateForm';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { api } from '../../services/api';
import type { Department } from '../../types/departments';
import type { RouteStop, RouteSummary } from '../../types/routes';
import { INPUT_LIMITS } from '../../utils/formUtils';

const ROUTES_PER_PAGE = 6;

const RoutesPage = () => {
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [startDeptId, setStartDeptId] = useState('');
  const [endDeptId, setEndDeptId] = useState('');
  const [stops, setStops] = useState<RouteDraftStop[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    activePage,
    endIndex,
    pageNumbers,
    paginatedItems: displayedRoutes,
    setCurrentPage,
    startIndex,
    totalItems,
    totalPages,
  } = usePagination(routes, ROUTES_PER_PAGE);

  useEffect(() => {
    Promise.all([
      api.get<{ data: RouteSummary[] }>('/routes'),
      api.get<{ data: Department[] }>('/departments'),
    ])
      .then(([routesRes, deptsRes]) => {
        setRoutes(routesRes.data);
        setDepartments(deptsRes.data);
      })
      .catch(() => setError('Не вдалося завантажити дані'))
      .finally(() => setIsLoading(false));
  }, []);

  const loadRouteStops = async (routeId: number) => {
    if (expandedRoute === routeId) {
      setExpandedRoute(null);
      return;
    }

    try {
      const res = await api.get<{ data: RouteSummary & { stops: RouteStop[] } }>(`/routes/${routeId}`);
      setRoutes((prev) =>
        prev.map((route) => (route.id === routeId ? { ...route, ...res.data } : route))
      );
      setExpandedRoute(routeId);
    } catch {
      setError('Не вдалося завантажити зупинки');
    }
  };

  const handleAddStop = () => {
    if (stops.length >= INPUT_LIMITS.routeStopsMax) return;
    setStops((prev) => [...prev, { departmentId: '' }]);
  };

  const handleRemoveStop = (index: number) => {
    setStops((prev) => prev.filter((_, stopIndex) => stopIndex !== index));
  };

  const handleStopChange = (index: number, value: string) => {
    setStops((prev) =>
      prev.map((stop, stopIndex) =>
        stopIndex === index ? { ...stop, departmentId: value } : stop
      )
    );
  };

  const handleReorderStops = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setStops((prev) => {
      const next = [...prev];
      const [dragged] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, dragged);
      return next;
    });
  };

  const handleStartDepartmentChange = (value: string) => {
    setStartDeptId(value);
    setStops((prev) => prev.filter((stop) => stop.departmentId !== value));
  };

  const handleEndDepartmentChange = (value: string) => {
    setEndDeptId(value);
    setStops((prev) => prev.filter((stop) => stop.departmentId !== value));
  };

  const resetCreateForm = () => {
    setIsCreating(false);
    setStartDeptId('');
    setEndDeptId('');
    setStops([]);
  };

  const handleCreate = async () => {
    if (!startDeptId || !endDeptId) return;
    setIsSubmitting(true);

    try {
      await api.post('/routes', {
        startDeptId: Number(startDeptId),
        endDeptId: Number(endDeptId),
        stops: stops
          .filter((stop) => stop.departmentId)
          .map((stop) => ({
            departmentId: Number(stop.departmentId),
          })),
      });

      const res = await api.get<{ data: RouteSummary[] }>('/routes');
      setRoutes(res.data);
      setCurrentPage(1);
      resetCreateForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка при створенні маршруту');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (routeId: number) => {
    if (!window.confirm('Деактивувати маршрут? Він буде прихований з UI, але залишиться в БД.')) return;

    try {
      await api.delete(`/routes/${routeId}`);
      const nextRoutes = routes.filter((route) => route.id !== routeId);
      const nextTotalPages = Math.ceil(nextRoutes.length / ROUTES_PER_PAGE);

      setRoutes(nextRoutes);
      setCurrentPage(Math.min(activePage, Math.max(1, nextTotalPages)));
      if (expandedRoute === routeId) {
        setExpandedRoute(null);
      }
    } catch {
      setError('Помилка при деактивації маршруту');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Route className="text-pine" size={32} /> Маршрути
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Транспортні маршрути між відділеннями
          </p>
        </div>
        <button
          onClick={() => setIsCreating((prev) => !prev)}
          className="flex items-center gap-2 px-6 py-3 bg-pine text-white rounded-2xl font-bold text-sm hover:bg-pine/90 transition-all"
        >
          <Plus size={18} /> Новий маршрут
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-medium">
          {error}
        </div>
      )}

      {isCreating && (
        <RoutesCreateForm
          departments={departments}
          startDeptId={startDeptId}
          endDeptId={endDeptId}
          stops={stops}
          isSubmitting={isSubmitting}
          onStartDepartmentChange={handleStartDepartmentChange}
          onEndDepartmentChange={handleEndDepartmentChange}
          onAddStop={handleAddStop}
          onRemoveStop={handleRemoveStop}
          onStopChange={handleStopChange}
          onReorderStops={handleReorderStops}
          onCancel={resetCreateForm}
          onCreate={handleCreate}
        />
      )}

      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Завантаження...</div>
      ) : routes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 font-medium">
          Маршрутів поки немає
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            {displayedRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isExpanded={expandedRoute === route.id}
                onToggle={() => loadRouteStops(route.id)}
                onDelete={() => handleDelete(route.id)}
              />
            ))}
          </div>

          <Pagination
            activePage={activePage}
            endIndex={endIndex}
            itemLabel="маршрутів"
            onPageChange={setCurrentPage}
            pageNumbers={pageNumbers}
            startIndex={startIndex}
            totalItems={totalItems}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default RoutesPage;
