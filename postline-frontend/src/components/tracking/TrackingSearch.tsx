import { Search, Loader2 } from 'lucide-react';
import { INPUT_LIMITS, INPUT_PATTERNS, sanitizeTrackingNumber } from '../../utils/formUtils';

interface Props {
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TrackingSearch = ({ searchQuery, isLoading, onSearchChange, onSubmit }: Props) => (
  <div className="bg-white/80 backdrop-blur p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all text-center">
    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
      Відстеження відправлення
    </h1>
    <p className="text-slate-500 mb-10 max-w-2xl mx-auto text-lg">
      Введіть номер накладної, щоб перевірити статус доставки та історію переміщень вашої посилки.
    </p>

    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Наприклад: PL-2024-00128"
          className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-pine focus:ring-2 focus:ring-pine/20 transition-all text-lg font-medium text-slate-800"
          value={searchQuery}
          onChange={(e) => onSearchChange(sanitizeTrackingNumber(e.target.value))}
          required
          minLength={INPUT_LIMITS.trackingMin}
          maxLength={INPUT_LIMITS.trackingMax}
          pattern={INPUT_PATTERNS.trackingNumber}
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !searchQuery.trim()}
        className="px-10 py-4 bg-pine text-white font-bold rounded-2xl hover:bg-pine/90 active:scale-95 transition-all shadow-lg hover:shadow-xl text-lg whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {isLoading && <Loader2 size={20} className="animate-spin" />}
        Відстежити
      </button>
    </form>
  </div>
);
