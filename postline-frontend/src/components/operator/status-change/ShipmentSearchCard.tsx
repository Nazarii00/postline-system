import type { FormEvent } from 'react';
import { ScanLine } from 'lucide-react';
import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
  sanitizeTrackingNumber,
} from '../../../utils/formUtils';

type ShipmentSearchCardProps = {
  trackingInput: string;
  isLoading: boolean;
  onTrackingInputChange: (value: string) => void;
  onSearch: (event?: FormEvent) => void;
};

export const ShipmentSearchCard = ({
  trackingInput,
  isLoading,
  onTrackingInputChange,
  onSearch,
}: ShipmentSearchCardProps) => (
  <div className="bg-white/80 backdrop-blur p-4 rounded-3xl shadow-sm border border-slate-200 hover:border-pine/30 transition-all">
    <form onSubmit={onSearch} className="relative flex items-center">
      <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl ml-1">
        <ScanLine size={24} />
      </div>
      <input
        type="text"
        autoFocus
        value={trackingInput}
        onChange={(event) => onTrackingInputChange(sanitizeTrackingNumber(event.target.value))}
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
);
