import { useState } from 'react';
import { ScanLine, AlertCircle, CheckCircle2, History, ArrowRight, Package, ArrowRightCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
  sanitizePlainText,
  sanitizeTrackingNumber,
} from '../../utils/formUtils';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  accepted: ['sorting'],
  sorting: ['in_transit'],
  in_transit: ['arrived'],
  arrived: ['ready_for_pickup'],
  ready_for_pickup: ['delivered'],
};

const DESTINATION_STATUSES = new Set(['arrived', 'ready_for_pickup', 'delivered']);

const STATUS_LABELS: Record<string, string> = {
  accepted: 'Прийнято',
  sorting: 'На сортуванні',
  in_transit: 'В дорозі',
  arrived: 'У відділенні',
  ready_for_pickup: 'Готове до видачі',
  delivered: 'Видано',
  returned: 'Повернуто',
  cancelled: 'Скасовано',
};

const getBadgeClass = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700';
    case 'ready_for_pickup':
      return 'bg-blue-100 text-blue-700';
    case 'in_transit':
      return 'bg-amber-100 text-amber-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

type Shipment = {
  id: number;
  tracking_number: string;
  status: string;
  origin_dept_id: number;
  dest_dept_id: number;
  current_dept_id: number;
  sender_name: string;
  receiver_name: string;
  shipment_type: string;
  weight_kg: string;
  origin_city: string;
  dest_city: string;
};

type HistoryItem = {
  tracking_number: string;
  newStatus: string;
  time: string;
};

const labelClass = 'block text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1.5';

const canApplyStatusInDepartment = (
  shipment: Shipment,
  nextStatus: string,
  departmentId?: number | null,
) => {
  if (!departmentId) return true;

  const targetDepartmentId = DESTINATION_STATUSES.has(nextStatus)
    ? shipment.dest_dept_id
    : shipment.current_dept_id;

  return Number(targetDepartmentId) === Number(departmentId);
};

const StatusChangePage = () => {
  const user = useAuthStore((state) => state.user);
  const [trackingInput, setTrackingInput] = useState('');
  const [scannedShipment, setScannedShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    setNewStatus('');
    setNotes('');

    const tracking = trackingInput.trim().toUpperCase();
    if (!tracking) return;

    setIsLoading(true);
    try {
      const res = await api.get<{ data: Shipment[] }>(`/shipments?trackingNumber=${tracking}`);
      const shipment = res.data[0];

      if (!shipment) {
        setScannedShipment(null);
        setError('Відправлення з таким трекінг-номером не знайдено.');
        return;
      }

      setScannedShipment(shipment);
      setTrackingInput('');
    } catch {
      setError('Помилка при пошуку відправлення.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyStatus = async () => {
    if (!scannedShipment || !newStatus) return;

    setIsLoading(true);
    try {
      await api.patch(`/shipments/${scannedShipment.id}/status`, {
        status: newStatus,
        notes: notes || undefined,
      });

      const timeString = new Date().toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setHistory((prev) => [
        { tracking_number: scannedShipment.tracking_number, newStatus, time: timeString },
        ...prev,
      ]);

      setSuccess(`Статус ${scannedShipment.tracking_number} успішно змінено на "${STATUS_LABELS[newStatus]}".`);
      setScannedShipment(null);
      setNewStatus('');
      setNotes('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка при зміні статусу.');
    } finally {
      setIsLoading(false);
    }
  };

  const workflowStatuses = scannedShipment ? (STATUS_TRANSITIONS[scannedShipment.status] ?? []) : [];
  const availableStatuses = scannedShipment
    ? workflowStatuses.filter((status) => canApplyStatusInDepartment(scannedShipment, status, user?.departmentId))
    : [];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
          Управління статусами
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2">
          Швидке оновлення стану відправлень за допомогою сканера або ручного вводу.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur p-4 rounded-3xl shadow-sm border border-slate-200 hover:border-pine/30 transition-all">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl ml-1">
                <ScanLine size={24} />
              </div>
              <input
                type="text"
                autoFocus
                value={trackingInput}
                onChange={(e) => setTrackingInput(sanitizeTrackingNumber(e.target.value))}
                placeholder="ВІДСКАНУЙТЕ АБО ВВЕДІТЬ ТТН..."
                required
                minLength={INPUT_LIMITS.trackingMin}
                maxLength={INPUT_LIMITS.trackingMax}
                pattern={INPUT_PATTERNS.trackingNumber}
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-4 py-3 text-lg font-black tracking-widest uppercase text-slate-800 placeholder:text-slate-300 placeholder:font-bold"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-4 bg-slate-100 hover:bg-pine hover:text-white text-slate-600 font-bold rounded-2xl transition-all active:scale-95 text-sm disabled:opacity-50"
              >
                {isLoading ? '...' : 'Знайти'}
              </button>
            </form>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-500 shrink-0" />
              <p className="text-sm font-bold text-rose-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-bold text-emerald-800">{success}</p>
            </div>
          )}

          {scannedShipment && (
            <div className="bg-white/90 backdrop-blur p-6 md:p-8 rounded-3xl shadow-sm border border-pine/20">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pine/10 text-pine rounded-2xl flex items-center justify-center">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Знайдено відправлення
                    </p>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                      {scannedShipment.tracking_number}
                    </h2>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p className="font-semibold">{scannedShipment.sender_name} {'->'} {scannedShipment.receiver_name}</p>
                  <p className="text-xs text-slate-400">{scannedShipment.origin_city} {'->'} {scannedShipment.dest_city}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6">
                <div className="flex-1 w-full bg-white p-5 rounded-2xl border border-slate-200 opacity-70">
                  <span className={labelClass}>Поточний статус</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="font-bold text-slate-600">
                      {STATUS_LABELS[scannedShipment.status] ?? scannedShipment.status}
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex text-slate-300 flex-shrink-0">
                  <ArrowRightCircle size={32} />
                </div>

                <div className="flex-1 w-full bg-white p-5 rounded-2xl border-2 border-pine/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-pine" />
                  <span className={labelClass}>Встановити новий</span>
                  {availableStatuses.length > 0 ? (
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full mt-2 bg-transparent border-none focus:ring-0 outline-none text-base font-black text-pine cursor-pointer appearance-none p-0"
                    >
                      <option value="" disabled>Оберіть наступний крок...</option>
                      {availableStatuses.map((status) => (
                        <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-2 text-base font-black text-emerald-600">
                      {workflowStatuses.length > 0
                        ? 'Немає доступної дії для вашого відділення'
                        : 'Фінальний статус'}
                    </div>
                  )}
                </div>
              </div>

              {availableStatuses.length > 0 && (
                <div className="mb-6">
                  <label className={labelClass}>Примітка (необов'язково)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(sanitizePlainText(e.target.value, INPUT_LIMITS.noteMax))}
                    placeholder="Додаткова інформація..."
                    maxLength={INPUT_LIMITS.noteMax}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
                  />
                </div>
              )}

              <div className="flex justify-end">
                {availableStatuses.length > 0 ? (
                  <button
                    onClick={handleApplyStatus}
                    disabled={!newStatus || isLoading}
                    className={`px-8 py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-3 text-sm tracking-wide ${
                      newStatus && !isLoading
                        ? 'bg-pine text-white shadow-md hover:bg-pine/90 active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'ЗБЕРЕЖЕННЯ...' : 'ПІДТВЕРДИТИ ЗМІНУ'}
                    {!isLoading && <ArrowRight size={18} />}
                  </button>
                ) : (
                  <button
                    onClick={() => setScannedShipment(null)}
                    className="px-8 py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-2xl transition-all active:scale-95 text-sm"
                  >
                    Закрити картку
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-pine/5 text-pine rounded-xl">
                <History size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Історія сесії</h3>
            </div>

            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-pine/20 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-slate-800 text-sm">{item.tracking_number}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{item.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Статус:</span>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getBadgeClass(item.newStatus)}`}>
                        {STATUS_LABELS[item.newStatus]}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm font-bold text-slate-400">Історія порожня</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusChangePage;
