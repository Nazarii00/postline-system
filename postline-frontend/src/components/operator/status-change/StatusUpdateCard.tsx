import { ArrowRight, ArrowRightCircle, Package } from 'lucide-react';
import { INPUT_LIMITS, sanitizePlainText } from '../../../utils/formUtils';
import type { Shipment } from './statusChangeTypes';
import { getStatusActionLabel, STATUS_LABELS } from './statusChangeUtils';

const labelClass = 'block text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1.5';

type StatusUpdateCardProps = {
  shipment: Shipment;
  availableStatuses: string[];
  workflowStatuses: string[];
  newStatus: string;
  notes: string;
  isLoading: boolean;
  onNewStatusChange: (status: string) => void;
  onNotesChange: (notes: string) => void;
  onApplyStatus: () => void;
  onClose: () => void;
};

export const StatusUpdateCard = ({
  shipment,
  availableStatuses,
  workflowStatuses,
  newStatus,
  notes,
  isLoading,
  onNewStatusChange,
  onNotesChange,
  onApplyStatus,
  onClose,
}: StatusUpdateCardProps) => (
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
            {shipment.tracking_number}
          </h2>
        </div>
      </div>
      <div className="text-right text-sm text-slate-500">
        <p className="font-semibold">{shipment.sender_name} {'->'} {shipment.receiver_name}</p>
        <p className="text-xs text-slate-400">{shipment.origin_city} {'->'} {shipment.dest_city}</p>
      </div>
    </div>

    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6">
      <div className="flex-1 w-full bg-white p-5 rounded-2xl border border-slate-200 opacity-70">
        <span className={labelClass}>Поточний статус</span>
        <div className="flex items-center gap-3 mt-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span className="font-bold text-slate-600">
            {STATUS_LABELS[shipment.status] ?? shipment.status}
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
            onChange={(event) => onNewStatusChange(event.target.value)}
            className="w-full mt-2 bg-transparent border-none focus:ring-0 outline-none text-base font-black text-pine cursor-pointer appearance-none p-0"
          >
            <option value="" disabled>Оберіть наступний крок...</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {getStatusActionLabel(shipment, status)}
              </option>
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
          onChange={(event) => onNotesChange(sanitizePlainText(event.target.value, INPUT_LIMITS.noteMax))}
          placeholder="Додаткова інформація..."
          maxLength={INPUT_LIMITS.noteMax}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine text-sm font-medium"
        />
      </div>
    )}

    <div className="flex justify-end">
      {availableStatuses.length > 0 ? (
        <button
          type="button"
          onClick={onApplyStatus}
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
          type="button"
          onClick={onClose}
          className="px-8 py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-2xl transition-all active:scale-95 text-sm"
        >
          Закрити картку
        </button>
      )}
    </div>
  </div>
);
