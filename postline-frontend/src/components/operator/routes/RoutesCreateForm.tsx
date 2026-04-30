import { useRef } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { Department } from '../../../types/departments';
import { INPUT_LIMITS } from '../../../utils/formUtils';

export type RouteDraftStop = {
  departmentId: string;
};

type RoutesCreateFormProps = {
  departments: Department[];
  startDeptId: string;
  endDeptId: string;
  stops: RouteDraftStop[];
  isSubmitting: boolean;
  onStartDepartmentChange: (value: string) => void;
  onEndDepartmentChange: (value: string) => void;
  onAddStop: () => void;
  onRemoveStop: (index: number) => void;
  onStopChange: (index: number, value: string) => void;
  onReorderStops: (fromIndex: number, toIndex: number) => void;
  onCancel: () => void;
  onCreate: () => void;
};

export const RoutesCreateForm = ({
  departments,
  startDeptId,
  endDeptId,
  stops,
  isSubmitting,
  onStartDepartmentChange,
  onEndDepartmentChange,
  onAddStop,
  onRemoveStop,
  onStopChange,
  onReorderStops,
  onCancel,
  onCreate,
}: RoutesCreateFormProps) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const getStopDepartmentOptions = (index: number) =>
    departments.filter((department) => {
      const departmentId = String(department.id);
      if (departmentId === startDeptId || departmentId === endDeptId) return false;

      return !stops.some((stop, stopIndex) =>
        stopIndex !== index && stop.departmentId === departmentId
      );
    });

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      onReorderStops(dragItem.current, dragOverItem.current);
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-pine/20 shadow-sm space-y-6">
      <h2 className="text-lg font-black text-slate-800">Новий маршрут</h2>
      <p className="text-sm text-slate-500">
        Оберіть відділення та проміжні точки. Відстань і орієнтовний час backend розрахує автоматично через API карт.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-black mb-2">
            Відправлення з <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={startDeptId}
            onChange={(event) => onStartDepartmentChange(event.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
          >
            <option value="">Оберіть відділення...</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.city} - {department.address}
              </option>
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
            onChange={(event) => onEndDepartmentChange(event.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
          >
            <option value="">Оберіть відділення...</option>
            {departments.filter((department) => department.id !== Number(startDeptId)).map((department) => (
              <option key={department.id} value={department.id}>
                {department.city} - {department.address}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs uppercase tracking-wider text-slate-500 font-black">
            Проміжні зупинки
          </label>
          <button
            type="button"
            onClick={onAddStop}
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
              onDragStart={() => {
                dragItem.current = index;
              }}
              onDragEnter={() => {
                dragOverItem.current = index;
              }}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => event.preventDefault()}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-grab"
            >
              <GripVertical size={16} className="text-slate-300 shrink-0" />
              <select
                value={stop.departmentId}
                onChange={(event) => onStopChange(index, event.target.value)}
                required
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pine"
              >
                <option value="">Відділення...</option>
                {getStopDepartmentOptions(index).map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.city} - {department.address}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onRemoveStop(index)}
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
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
        >
          Скасувати
        </button>
        <button
          type="button"
          onClick={onCreate}
          disabled={!startDeptId || !endDeptId || isSubmitting}
          className="px-6 py-3 bg-pine text-white rounded-2xl font-bold text-sm hover:bg-pine/90 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Розрахунок...' : 'Створити маршрут'}
        </button>
      </div>
    </div>
  );
};
