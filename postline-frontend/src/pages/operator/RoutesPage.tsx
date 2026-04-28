import { useState, useEffect, useRef } from 'react';
import { Route, MapPin, Plus, ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import type { Department } from '../../types/departments';
import type { RouteSummary, RouteStop } from '../../types/routes';
import { INPUT_LIMITS, preventInvalidNumberInput } from '../../utils/formUtils';

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
  const [distanceKm, setDistanceKm] = useState('');
  const [estTimeHours, setEstTimeHours] = useState('');
  const [stops, setStops] = useState<{ departmentId: string; distanceFromPrev: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and drop для зупинок.
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
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
        prev.map((route) => (route.id === routeId ? { ...route, stops: res.data.stops } : route))
      );
      setExpandedRoute(routeId);
    } catch {
      setError('Не вдалося завантажити зупинки');
    }
  };

  const handleAddStop = () => {
    if (stops.length >= INPUT_LIMITS.routeStopsMax) return;
    setStops((prev) => [...prev, { departmentId: '', distanceFromPrev: '' }]);
  };

  const handleRemoveStop = (index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStopChange = (
    index: number,
    field: 'departmentId' | 'distanceFromPrev',
    value: string
  ) => {
    setStops((prev) => prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop)));
  };

  const handleDragStart = (_: React.DragEvent, index: number) => {
    dragItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newStops = [...stops];
      const dragged = newStops.splice(dragItem.current, 1)[0];
      newStops.splice(dragOverItem.current, 0, dragged);
      setStops(newStops);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleCreate = async () => {
    if (!startDeptId || !endDeptId) return;
    if (
      (distanceKm && Number(distanceKm) > INPUT_LIMITS.distanceKmMax)
      || (estTimeHours && Number(estTimeHours) > INPUT_LIMITS.durationHoursMax)
      || stops.some((stop) => stop.distanceFromPrev && Number(stop.distanceFromPrev) > INPUT_LIMITS.distanceKmMax)
    ) {
      setError('Перевірте відстань і час: значення виходять за допустимі межі.');
      return;
    }
    setIsSubmitting(true);

    try {
      await api.post('/routes', {
        startDeptId: Number(startDeptId),
        endDeptId: Number(endDeptId),
        distanceKm: distanceKm ? Number(distanceKm) : null,
        estTimeHours: estTimeHours ? Number(estTimeHours) : null,
        stops: stops
          .filter((stop) => stop.departmentId)
          .map((stop) => ({
            departmentId: Number(stop.departmentId),
            distanceFromPrev: stop.distanceFromPrev ? Number(stop.distanceFromPrev) : null,
          })),
      });

      const res = await api.get<{ data: RouteSummary[] }>('/routes');
      setRoutes(res.data);
      setCurrentPage(1);
      setIsCreating(false);
      setStartDeptId('');
      setEndDeptId('');
      setDistanceKm('');
      setEstTimeHours('');
      setStops([]);
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
        <div className="bg-white p-6 rounded-3xl border border-pine/20 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-800">Новий маршрут</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
                Відправлення з <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={startDeptId}
                onChange={(e) => setStartDeptId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
              >
                <option value="">Оберіть відділення...</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.city} - {department.address}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
                Прибуття до <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={endDeptId}
                onChange={(e) => setEndDeptId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
              >
                <option value="">Оберіть відділення...</option>
                {departments.filter((department) => department.id !== Number(startDeptId)).map((department) => (
                  <option key={department.id} value={department.id}>{department.city} - {department.address}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
                Відстань (км)
              </label>
              <input
                type="number"
                min="0"
                max={INPUT_LIMITS.distanceKmMax}
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                onKeyDown={preventInvalidNumberInput}
                placeholder="540"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
                Орієнтовний час (год)
              </label>
              <input
                type="number"
                min="0"
                max={INPUT_LIMITS.durationHoursMax}
                step="0.1"
                value={estTimeHours}
                onChange={(e) => setEstTimeHours(e.target.value)}
                onKeyDown={preventInvalidNumberInput}
                placeholder="6.5"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-black">
                Проміжні зупинки
              </label>
              <button
                type="button"
                onClick={handleAddStop}
                disabled={stops.length >= INPUT_LIMITS.routeStopsMax}
                className="text-xs font-bold text-pine hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Додати зупинку
              </button>
            </div>

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={() => {
                    dragOverItem.current = index;
                  }}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-grab"
                >
                  <GripVertical size={16} className="text-slate-300 shrink-0" />
                  <select
                    value={stop.departmentId}
                    onChange={(e) => handleStopChange(index, 'departmentId', e.target.value)}
                    required
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pine"
                  >
                    <option value="">Відділення...</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>{department.city} - {department.address}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max={INPUT_LIMITS.distanceKmMax}
                    step="0.1"
                    value={stop.distanceFromPrev}
                    onChange={(e) => handleStopChange(index, 'distanceFromPrev', e.target.value)}
                    onKeyDown={preventInvalidNumberInput}
                    placeholder="км від попередньої"
                    className="w-36 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pine"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setIsCreating(false)}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Скасувати
            </button>
            <button
              onClick={handleCreate}
              disabled={!startDeptId || !endDeptId || isSubmitting}
              className="px-6 py-3 bg-pine text-white rounded-2xl font-bold text-sm hover:bg-pine/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Збереження...' : 'Створити маршрут'}
            </button>
          </div>
        </div>
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
              <div key={route.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all"
                  onClick={() => loadRouteStops(route.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-pine/5 text-pine rounded-2xl">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800">
                        {route.start_city} - {route.end_city}
                      </p>
                      <div className="flex gap-4 mt-1">
                        {route.distance_km && (
                          <span className="text-xs text-slate-400 font-medium">{route.distance_km} км</span>
                        )}
                        {route.est_time_hours && (
                          <span className="text-xs text-slate-400 font-medium">~{route.est_time_hours} год</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(route.id);
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-all"
                      title="Деактивувати"
                    >
                      <Trash2 size={18} />
                    </button>
                    {expandedRoute === route.id
                      ? <ChevronUp size={20} className="text-slate-400" />
                      : <ChevronDown size={20} className="text-slate-400" />
                    }
                  </div>
                </div>

                {expandedRoute === route.id && route.stops && (
                  <div className="border-t border-slate-100 px-6 pb-6 pt-4">
                    {route.stops.length === 0 ? (
                      <p className="text-sm text-slate-400 font-medium">Проміжних зупинок немає</p>
                    ) : (
                      <div className="space-y-2">
                        {route.stops.map((stop, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-pine/10 text-pine text-xs font-black flex items-center justify-center shrink-0">
                              {stop.sequence_order}
                            </span>
                            <span className="font-medium text-slate-700">{stop.city} - {stop.address}</span>
                            {stop.distance_from_prev_km && (
                              <span className="text-xs text-slate-400 ml-auto">{stop.distance_from_prev_km} км</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
